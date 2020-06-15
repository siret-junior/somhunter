
#ifndef features_h
#define features_h

#include "Frames.h"

#include <cmath>
#include <map>
#include <queue>

#include "distfs.h"

class ImageFeatures
{
	size_t n, features_dim;
	std::vector<float> data;

public:
	ImageFeatures(const Frames &, const Config &config);

	size_t size() const { return n; }
	size_t dim() const { return features_dim; }

	inline const float *fv(size_t i) const
	{
		return data.data() + features_dim * i;
	}

	std::vector<ImageId> get_top_knn(const Frames &frames,
	                                 ImageId id,
	                                 size_t per_vid_limit = 0,
	                                 size_t from_shot_limit = 0) const
	{
		return get_top_knn(frames,
		                   id,
		                   [](ImageId frame_ID) { return true; },
		                   per_vid_limit,
		                   from_shot_limit);
	}

	inline std::vector<ImageId> get_top_knn(
	  const Frames &frames,
	  ImageId id,
	  std::function<bool(ImageId ID)> pred,
	  size_t per_vid_limit = 0,
	  size_t from_shot_limit = 0) const
	{
		if (per_vid_limit == 0)
			per_vid_limit = frames.size();

		if (from_shot_limit == 0)
			from_shot_limit = frames.size();

		auto cmp = [](const std::pair<ImageId, float> &left,
		              const std::pair<ImageId, float> &right) {
			return left.second > right.second;
		};

		std::priority_queue<std::pair<ImageId, float>,
		                    std::vector<std::pair<ImageId, float>>,
		                    decltype(cmp)>
		  q3(cmp);

		for (ImageId i{ 0 }; i < n; ++i) {
			auto d = d_dot(id, i);
			q3.emplace(i, d);
		}

		std::vector<ImageId> res;
		res.reserve(TOPKNN_LIMIT);

		size_t num_videos = frames.get_num_videos();
		std::vector<size_t> per_vid_frame_hist(num_videos, 0);
		std::map<VideoId, std::map<ShotId, size_t>> frames_per_shot;

		while (res.size() < TOPKNN_LIMIT) {
			auto [adept_ID, f]{ q3.top() };
			q3.pop();

			auto vf = frames.get_frame(adept_ID);

			// If we have already enough from this video
			if (per_vid_frame_hist[vf.video_ID] >= per_vid_limit)
				continue;

			// If we have already enough from this shot
			if (frames_per_shot[vf.video_ID][vf.shot_ID] >=
			    from_shot_limit)
				continue;

			// Only if predicate is true
			if (pred(adept_ID)) {
				res.emplace_back(adept_ID);
				per_vid_frame_hist[vf.video_ID]++;
				frames_per_shot[vf.video_ID][vf.shot_ID]++;
			}
		}

		return res;
	}

	inline float d_manhattan(size_t i, size_t j) const
	{
		return ::d_manhattan(fv(i), fv(j), features_dim);
	}

	inline float d_sqeucl(size_t i, size_t j) const
	{
		return ::d_sqeucl(fv(i), fv(j), features_dim);
	}

	inline float d_eucl(size_t i, size_t j) const
	{
		return sqrtf(d_sqeucl(i, j));
	}

	inline float d_dot(size_t i, size_t j) const
	{
		return 1 - ::d_dot(fv(i), fv(j), features_dim);
	}

	inline float d_cos(size_t i, size_t j) const
	{
		float s = 0, w1 = 0, w2 = 0;
		const float *iv = fv(i), *jv = fv(j);
		for (size_t d = 0; d < features_dim; ++d) {
			s += iv[d] * jv[d];
			w1 += square(iv[d]);
			w2 += square(jv[d]);
		}
		if (w1 == 0 && w2 == 0)
			return 0;
		return 1 - s / sqrtf(w1 * w2);
	}
};

#endif
