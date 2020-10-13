
/* This file is part of SOMHunter.
 *
 * Copyright (C) 2020 František Mejzlík <frankmejzlik@gmail.com>
 *                    Mirek Kratochvil <exa.exa@gmail.com>
 *                    Patrik Veselý <prtrikvesely@gmail.com>
 *
 * SOMHunter is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 2 of the License, or (at your option)
 * any later version.
 *
 * SOMHunter is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * SOMHunter. If not, see <https://www.gnu.org/licenses/>.
 */

#ifndef scores_h
#define scores_h

#include <map>
#include <set>
#include <vector>

#include "DatasetFeatures.h"
#include "DatasetFrames.h"

class ScoreModel
{
	/** Current score distribution for the frames. */
	std::vector<float> _scores;

	/**
	 * Frames mask telling what frames should be placed inside the
	 * results.
	 * 
	 * true <=> present in the result set
	 * false <=> filtered out
	 */
	std::vector<bool> _mask;

	// *** CACHING VARIABLES ***
	mutable std::vector<ImageId> _topn_cache;
	mutable bool _cache_dirty;
	mutable std::vector<ImageId> _topn_ctx_cache;
	mutable bool _cache_ctx_dirty;

public:
	ScoreModel(const DatasetFrames& p)
	  : _scores(p.size(), 1.0F)
	  , _mask(p.size(), true)
	  , _cache_dirty{ true }
	  , _cache_ctx_dirty{ true }
	{}

	bool operator==(const ScoreModel& other) const;
	float operator[](ImageId i) const { return _scores[i]; }

	void reset();

	/** Multiplies the relevance score with the provided value. */
	float adjust(ImageId i, float prob);

	/** Hard-sets the score with the provided value (normalization
	 * required). */
	float set(ImageId i, float prob);

	/** Pointer to the begin of the data. */
	const float* v() const { return _scores.data(); }

	/** Returns number of scores stored. */
	size_t size() const { return _scores.size(); }

	/** Normalizes the score distribution. */
	void normalize();

	void reset_mask()
	{
		_cache_dirty = true;

		std::transform(_mask.begin(), _mask.end(), _mask.begin(), [](const bool&) { return true; });
	};

	/** Returns the current value for the frame */
	bool is_masked(ImageId ID) const { return _mask[ID]; }

	/** Sets the mask value for the frame. */
	bool set_mask(ImageId ID, bool val)
	{
		_cache_dirty = true;
		return _mask[ID] = val;
	}

	/**
	 * Applies relevance feedback rescore based on the Bayesian update rule.
	 */
	void apply_bayes(std::set<ImageId> likes, const std::set<ImageId>& screen, const DatasetFeatures& features);

	/**
	 * Gets the images with the highest scores but respecting the provided
	 * limits. */
	std::vector<ImageId> top_n(const DatasetFrames& frames,
	                           size_t n,
	                           size_t from_vid_limit = 0,
	                           size_t from_shot_limit = 0) const;

	/**
	 * Gets the images with the highest scores while respecting the
	 * provided limits and each frame is wrapped by it's context based on
	 * the number of frames per line. */
	std::vector<ImageId> top_n_with_context(const DatasetFrames& frames,
	                                        size_t n,
	                                        size_t from_vid_limit,
	                                        size_t from_shot_limit) const;

	/** Samples `n` random frames from the current scores distribution. */
	std::vector<ImageId> weighted_sample(size_t n, float pow = 1) const;

	/** Samples a random frame from the current scores distribution. */
	ImageId weighted_example(const std::vector<ImageId>& subset) const;

	/** Returns the current rank of the provided frame (starts from 0). */
	size_t frame_rank(ImageId i) const;
};

#endif
