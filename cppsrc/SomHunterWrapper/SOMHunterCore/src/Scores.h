
#ifndef scores_h
#define scores_h

#include <map>
#include <set>
#include <vector>

#include "Features.h"
#include "Frames.h"

class ScoreModel
{
	// assert: all scores are always > 0
	std::vector<float> scores;

public:
	ScoreModel(const Frames &p)
	  : scores(p.size(), 1.0f)
	{}

	void reset()
	{
		for (auto &i : scores)
			i = 1.0f;
	}

	// hard remove image
	float adjust(ImageId i, float prob) { return scores[i] *= prob; }
	float set(ImageId i, float prob) { return scores[i] = prob; }
	float operator[](ImageId i) const { return scores[i]; }
	const float *v() const { return scores.data(); }
	size_t size() const { return scores.size(); }
	void normalize();

	void apply_bayes(std::set<ImageId> likes,
	                 std::set<ImageId> screen,
	                 const ImageFeatures &features);

	// gets images with top scores and skips first offset
	std::vector<ImageId> top_n(const Frames &frames,
	                           size_t n,
	                           size_t from_vid_limit = 0,
	                           size_t from_shot_limit = 0) const;
	// gets images with top scores with temporal context
	std::vector<ImageId> top_n_with_context(const Frames &frames,
	                                        size_t n,
	                                        size_t from_vid_limit,
	                                        size_t from_shot_limit) const;
	std::vector<ImageId> weighted_sample(size_t n, float pow = 1) const;
	ImageId weighted_example(const std::vector<ImageId> &subset) const;
	size_t rank_of_image(ImageId i) const;
};

#endif
