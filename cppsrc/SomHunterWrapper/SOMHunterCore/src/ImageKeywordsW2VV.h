
#ifndef IMAGE_KEYWORDS_W2VV_H_
#define IMAGE_KEYWORDS_W2VV_H_

#include <cassert>
#include <fstream>
#include <map>
#include <set>
#include <string>
#include <vector>

#include "Frames.h"
#include "Scores.h"
#include "common.h"
#include "config_json.h"
#include "utils.h"

struct Keyword
{
	KeywordId kw_ID;
	SynsetId synset_ID;
	SynsetStrings synset_strs;
	KwDescription desc;

	/** Best representative images for this keyword */
	std::vector<ImageId> top_ex_imgs;
};

class ImageKeywordsW2VV
{
	std::vector<Keyword> keywords;
	FeatureMatrix kw_features;
	FeatureVector kw_features_bias_vec;
	FeatureMatrix kw_pca_mat;
	FeatureVector kw_pca_mean_vec;

public:
	static std::vector<Keyword> parse_kw_classes_text_file(
	  const std::string &filepath);

	/**
	 * Parses float matrix from a binary file that is written in row-major
	 * format and starts at `begin_offset` offset.k FORMAT: Matrix of 4B
	 * floats, row - major:
	 *    - each line is dim_N * 4B floats
	 *    - number of lines is number of selected frames
	 */
	// @todo Make this template and inside some `Parsers` class
	FeatureMatrix parse_float_matrix(const std::string &filepath,
	                                 size_t row_dim,
	                                 size_t begin_offset = 0);
	/**
	 * FORMAT:
	 *    Matrix of 4B floats:
	 *    - each line is dim * 4B floats
	 *    - number of lines is number of selected frames
	 */
	// @todo Make this template and inside some `Parsers` class
	FeatureVector parse_float_vector(const std::string &filepath,
	                                 size_t dim,
	                                 size_t begin_offset = 0);

	inline ImageKeywordsW2VV(const Config &config)
	  : keywords(parse_kw_classes_text_file(config.kws_file))
	  , kw_features(parse_float_matrix(config.kw_scores_mat_file,
	                                   config.pre_PCA_features_dim))
	  , kw_features_bias_vec(
	      parse_float_vector(config.kw_bias_vec_file,
	                         config.pre_PCA_features_dim))
	  , kw_pca_mat(parse_float_matrix(config.kw_PCA_mat_file,
	                                  config.pre_PCA_features_dim))
	  , kw_pca_mean_vec(parse_float_vector(config.kw_bias_vec_file,
	                                       config.pre_PCA_features_dim))
	{}

	ImageKeywordsW2VV(const ImageKeywordsW2VV &) = delete;
	ImageKeywordsW2VV &operator=(const ImageKeywordsW2VV &) = delete;

	ImageKeywordsW2VV(ImageKeywordsW2VV &&) = default;
	ImageKeywordsW2VV &operator=(ImageKeywordsW2VV &&) = default;
	~ImageKeywordsW2VV() noexcept = default;

	/**
	 * Gets all string representants of this keyword.
	 */
	const Keyword &operator[](KeywordId idx) const
	{
		// Get all keywords with this Keyword ID
		return keywords[idx];
	}

	KwSearchIds find(const std::string &search,
	                 size_t num_limit = 10) const;

	void rank_query(const std::vector<std::vector<KeywordId>> &positive,
	                const std::vector<std::vector<KeywordId>> &negative,
	                ScoreModel &model,
	                const ImageFeatures &features,
	                const Frames &frames,
	                const Config &cfg) const;

	void rank_sentence_query(const std::string &query,
	                         ScoreModel &model,
	                         const ImageFeatures &features,
	                         const Frames &frames,
	                         const Config &cfg) const;

private:
	void apply_temp_queries(std::vector<std::vector<float>> &dist_cache,
	                        ImageId img_ID,
	                        const FeatureMatrix &queries,
	                        size_t query_idx,
	                        float &result_dist,
	                        const ImageFeatures &features,
	                        const Frames &frames) const;

	/**
	 * Sorts all images based on provided query and retrieves vector
	 * of image IDs with their distance from the query.
	 *
	 */
	std::vector<std::pair<ImageId, float>> get_sorted_frames(
	  const std::vector<std::vector<KeywordId>> &positive,
	  const std::vector<std::vector<KeywordId>> &negative,
	  const ImageFeatures &features,
	  const Frames &frames,
	  const Config &cfg) const;
};

#endif // IMAGE_KEYWORDS_W2VV_H_
