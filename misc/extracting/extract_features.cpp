//g++ -std=c++17 extract_features.cpp -I libtorch/include -I libtorch/include/torch/csrc/api/include -L libtorch/lib -lc10 -ltorch -ltorch_cpu  -lstdc++fs -D_GLIBCXX_USE_CXX11_ABI=1 `pkg-config --cflags --libs opencv` -o cpp_inference



#include <torch/torch.h>
#include <torch/script.h>
#include <torch/linalg.h>
#include <iostream>
#include <fstream>
#include <memory>
#include <string>
#include <vector>
#include <opencv4/opencv2/core/core.hpp>
#include <opencv2/opencv.hpp>
#include <opencv4/opencv2/highgui/highgui.hpp>
#include <opencv4/opencv2/imgcodecs.hpp>
#include <experimental/filesystem>


namespace fs = std::experimental::filesystem;

std::vector<float> parse_float_vector(const std::string &filepath,
                                  size_t dim,
                                  size_t begin_offset = 0)
{
	// Open file for reading as binary from the end side
	std::ifstream ifs(filepath, std::ios::binary | std::ios::ate);

	// If failed to open file
	if (!ifs)
		throw std::runtime_error("Error opening file: " + filepath);

	// Get end of file
	auto end = ifs.tellg();

	// Get iterator to begining
	ifs.seekg(0, std::ios::beg);

	// Compute size of file
	auto size = std::size_t(end - ifs.tellg());

	// If emtpy file
	if (size == 0) {
		throw std::runtime_error("Empty file opened!");
	}

	// Calculate byte length of each row (dim_N * sizeof(float))
	size_t row_byte_len = dim * sizeof(float);

	// Create line buffer
	std::vector<char> line_byte_buffer;
	line_byte_buffer.resize(row_byte_len);

	// Start reading at this offset
	ifs.ignore(begin_offset);

	// Initialize vector of floats for this row
	std::vector<float> features_vector;
	features_vector.reserve(dim);

	// Read binary "lines" until EOF
	while (ifs.read(line_byte_buffer.data(), row_byte_len)) {
		size_t curr_offset = 0;

		// Iterate through all floats in a row
		for (size_t i = 0; i < dim; ++i) {
			features_vector.emplace_back(*reinterpret_cast<float *>(
			  line_byte_buffer.data() + curr_offset));

			curr_offset += sizeof(float);
		}

		// Read just one line
		break;
	}

	return features_vector;
}


std::vector<cv::Rect> get_RoIs(int width, int height)
{
	std::vector<std::vector<float>> RoIs = {
		{0.1, 0.2, 0.4, 0.6},
		{0.3, 0.2, 0.4, 0.6},
		{0.5, 0.2, 0.4, 0.6},
		{0.0, 0.0, 1.0, 1.0},

		{0.0, 0.0, 0.4, 0.6},
		{0.2, 0.0, 0.4, 0.6},
		{0.4, 0.0, 0.4, 0.6},
		{0.6, 0.0, 0.4, 0.6},

		{0.0, 0.4, 0.4, 0.6},
		{0.2, 0.4, 0.4, 0.6},
		{0.4, 0.4, 0.4, 0.6},
		{0.6, 0.4, 0.4, 0.6},	
	};

	std::vector<cv::Rect> rects;
	for(auto && r : RoIs)
	{
		rects.push_back(cv::Rect(r[0] * width, r[1] * height, r[2] * width, r[3] * height));
	}
	return rects;
}

torch::Tensor get_features(cv::Mat image, 
						torch::jit::script::Module resnext101, 
						torch::jit::script::Module resnet152,
						torch::Tensor weights,
						torch::Tensor bias,
						torch::Tensor kw_pca_mat,
						torch::Tensor kw_pca_mean_vec
						)
{
	cv::Size s = image.size();

	std::vector<cv::Rect> RoIs = get_RoIs(s.width, s.height);

	float means[] = {123.68, 116.779, 103.939}; 
	std::vector<torch::Tensor> batch;
	std::vector<torch::Tensor> batch_norm;

	for(int i = 0; i < RoIs.size(); i++)
	{
		cv::Mat region = image(RoIs[i]);
		cv::resize(region, region, cv::Size(224, 224));

		auto tensor_image = torch::from_blob(region.data, {region.rows, region.cols, region.channels() }, at::kByte).to(torch::kFloat);
		
		torch::Tensor t_means = torch::from_blob(means, {3}).unsqueeze_(0).unsqueeze_(0);

		auto tensor_image_norm = tensor_image - t_means;

		tensor_image = tensor_image.permute({ 2,0,1 });
		tensor_image_norm = tensor_image_norm.permute({ 2,0,1 });
		
		tensor_image.unsqueeze_(0);
		tensor_image_norm.unsqueeze_(0);

		batch.push_back(tensor_image);
		batch_norm.push_back(tensor_image_norm);
	}

	auto batch_of_tensors = torch::cat(batch);
	auto batch_of_tensors_norm = torch::cat(batch_norm);

	at::Tensor resnext101_feature = resnext101.forward({batch_of_tensors_norm}).toTensor();
	at::Tensor resnet152_feature = resnet152.forward({batch_of_tensors}).toTensor();

	torch::Tensor feature = torch::cat({resnext101_feature, resnet152_feature}, 1).to(torch::kFloat32).detach();

	// squeeze 4096 to 2048
	feature = feature.unsqueeze(0).permute({1, 0, 2});
	feature =  torch::tanh(torch::matmul(feature, weights).squeeze(1) + bias);

	// norm
	auto norm = torch::linalg::linalg_norm(feature, 2, {1}, true, torch::kFloat32);
	feature = torch::div(feature, norm);

	// PCA
	feature = feature - kw_pca_mean_vec;
	feature = feature.unsqueeze(0).permute({1, 0, 2});
	feature = torch::matmul(feature, kw_pca_mat).squeeze(1);

	// norm
	norm = torch::linalg::linalg_norm(feature, 2, {1}, true, torch::kFloat32);
	feature = torch::div(feature, norm);
	return feature;
}


int main(int argc, const char* argv[]) {

    torch::jit::script::Module resnet152;
    try 
    {
        resnet152 = torch::jit::load("models/traced_Resnet152.pt");
    }
    catch (const c10::Error& e) 
    {
        std::cerr << "error loading the model\n";
        return -1;
    }

    torch::jit::script::Module resnext101;
    try 
    {
        resnext101 = torch::jit::load("models/traced_Resnext101.pt");
    }
    catch (const c10::Error& e) 
    {
        std::cerr << "error loading the model\n";
        return -1;
    }

    auto bias = torch::tensor(parse_float_vector("extractor/models/w2vv-img_bias-2048floats.bin", 2048));
    auto weights = torch::tensor(parse_float_vector("extractor/models/w2vv-img_weight-2048x4096floats.bin", 4096*2048)).reshape({2048, 4096}).permute({1, 0});

	auto kw_pca_mat = torch::tensor(parse_float_vector("data/ITEC_w2vv/ITEC_20200411.w2vv.pca.matrix.bin", 128*2048)).reshape({128, 2048}).permute({1, 0});
	auto kw_pca_mean_vec = torch::tensor(parse_float_vector("data/ITEC_w2vv/ITEC_20200411.w2vv.pca.mean.bin", 2048));

	std::string thumbs = "public/thumbs/";
	std::string frames = "data/ITEC_w2vv/ITEC.keyframes.dataset";

	std::vector<std::fstream> datafiles;
	for(int i = 0; i < 12; i++)
		datafiles.push_back(std::fstream("data/region_" + std::to_string(i) + ".bin", std::ios::out | std::ios::binary));


	std::string thumb;
	std::ifstream filenames(frames);
	while (std::getline(filenames, thumb))
	{
		std::cout << thumb << '\n';
		cv::Mat src = cv::imread(thumbs + thumb);
		torch::Tensor features =  get_features(src,resnext101, resnet152, weights, bias, kw_pca_mat, kw_pca_mean_vec);
		for(size_t i = 0; i < 12; i++)
		{
			datafiles[i].write(reinterpret_cast<const char*>(features[i].data_ptr<float>()), 128 * sizeof(float));
		}
	}

	for(int i = 0; i < 12; i++)
		datafiles[i].close();


}
