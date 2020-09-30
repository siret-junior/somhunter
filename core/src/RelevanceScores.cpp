
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

#include "RelevanceScores.h"

#include <algorithm>
#include <cassert>
#include <functional>
#include <map>
#include <random>
#include <set>
#include <thread>
#include <vector>

#include "log.h"

#define MINIMAL_SCORE 1e-12f

struct FrameScoreIdPair
{
	float score;
	ImageId id;

	inline bool operator==(const FrameScoreIdPair &a) const
	{
		return score == a.score && id == a.id;
	}

	inline bool operator<(const FrameScoreIdPair &a) const
	{
		if (score < a.score)
			return true;
		if (score > a.score)
			return false;
		return id < a.id;
	}

	inline bool operator>(const FrameScoreIdPair &a) const
	{
		if (score > a.score)
			return true;
		if (score < a.score)
			return false;
		return id > a.id;
	}
};

// the dank C++ standard is still missing adjust_heap!
// (this is maximum heap w.r.t. the supplied `less`)
template<typename T, typename C>
static void
heap_down(T *heap, size_t start, size_t lim, C less = std::less<T>())
{
	for (;;) {
		size_t L = 2 * start + 1;
		size_t R = L + 1;
		if (R < lim) {
			if (less(heap[L], heap[R])) {
				if (less(heap[start], heap[R])) {
					std::swap(heap[start], heap[R]);
					start = R;
				} else
					break;
			} else {
				if (less(heap[start], heap[L])) {
					std::swap(heap[start], heap[L]);
					start = L;
				} else
					break;
			}
		} else if (L < lim) {
			if (less(heap[start], heap[L]))
				std::swap(heap[start], heap[L]);
			break; // exit safely!
		} else
			break;
	}
}

bool
ScoreModel::operator==(const ScoreModel &other) const
{
	return (_scores == other._scores);
}

void
ScoreModel::reset()
{
	_cache_dirty = true;
	_cache_ctx_dirty = true;

	for (auto &i : _scores)
		i = 1.0f;
}

float
ScoreModel::adjust(ImageId i, float prob)
{
	_cache_dirty = true;
	_cache_ctx_dirty = true;

	return _scores[i] *= prob;
}

float
ScoreModel::set(ImageId i, float prob)
{
	_cache_dirty = true;
	_cache_ctx_dirty = true;

	return _scores[i] = prob;
}

std::vector<ImageId>
ScoreModel::top_n_with_context(const DatasetFrames &frames,
                               size_t n,
                               size_t from_vid_limit,
                               size_t from_shot_limit) const
{
	// Is this cached
	// !! We assume that vid/shot limits do not change during the runtime.
	if (!_cache_ctx_dirty) {
		return _topn_ctx_cache;
	}

	/* This display needs to have `GUI_IMG_GRID_WIDTH`-times more images
	if we want to keep reporting `n` unique results. */
	n = n * DISPLAY_GRID_WIDTH;

	auto to_show = top_n(
	  frames, n / DISPLAY_GRID_WIDTH, from_vid_limit, from_shot_limit);

	_topn_ctx_cache.clear();
	_topn_ctx_cache.reserve(n);
	for (auto &&selected : to_show) {
		auto video_id = frames.get_video_id(selected);
		for (int i = -TOP_N_SELECTED_FRAME_POSITION;
		     i < DISPLAY_GRID_WIDTH - TOP_N_SELECTED_FRAME_POSITION;
		     ++i) {
			if (frames.get_video_id(selected + i) == video_id) {
				_topn_ctx_cache.push_back(selected + i);
			} else {
				_topn_ctx_cache.push_back(IMAGE_ID_ERR_VAL);
			}
		}
	}

	_cache_ctx_dirty = false;
	return _topn_ctx_cache;
}

std::vector<ImageId>
ScoreModel::top_n(const DatasetFrames &frames,
                  size_t n,
                  size_t from_vid_limit,
                  size_t from_shot_limit) const
{
	// Is this cached
	// !! We assume that vid/shot limits do not change during the runtime.
	if (!_cache_dirty) {
		return _topn_cache;
	}

	if (from_vid_limit == 0)
		from_vid_limit = _scores.size();

	if (from_shot_limit == 0)
		from_shot_limit = _scores.size();

	if (n > _scores.size())
		n = _scores.size();

	std::vector<FrameScoreIdPair> score_ids;
	for (ImageId i = 0; i < _scores.size(); ++i) {
		auto mask{ _mask[i] };

		// Filter out masked values
		if (mask) {
			score_ids.emplace_back(
			  FrameScoreIdPair{ _scores[i], i });
		}
	}

	std::sort(
	  score_ids.begin(), score_ids.end(), std::greater<FrameScoreIdPair>());

	std::map<VideoId, size_t> frames_per_vid;
	std::map<VideoId, std::map<ShotId, size_t>> frames_per_shot;

	_topn_cache.clear();
	_topn_cache.reserve(n);
	size_t t = 0;
	for (ImageId i = 0; t < n && i < score_ids.size(); ++i) {
		ImageId frame = score_ids[i].id;
		auto vf = frames.get_frame(frame);

		// If we have already enough from this video
		if (frames_per_vid[vf.video_ID]++ >= from_vid_limit)
			continue;

		// If we have already enough from this shot
		if (frames_per_shot[vf.video_ID][vf.shot_ID]++ >=
		    from_shot_limit)
			continue;

		_topn_cache.push_back(frame);
		++t;
	}

	_cache_dirty = false;
	return _topn_cache;
}

std::vector<ImageId>
ScoreModel::weighted_sample(size_t k, float pow) const
{
	size_t n = _scores.size();

	assert(n >= 2);
	assert(k < n);

	std::random_device rd;
	std::mt19937 gen(rd());
	std::uniform_real_distribution<float> real_dist(0.0f, 1.0f);

	size_t branches = n - 1;
	std::vector<float> tree(branches + n, 0);
	float sum = 0;
	for (size_t i = 0; i < n; ++i)
		sum += tree[branches + i] = powf(_scores[i], pow);

	auto upd = [&tree, branches, n](size_t i) {
		const size_t l = 2 * i + 1;
		const size_t r = 2 * i + 2;
		if (i < branches + n)
			tree[i] = ((l < branches + n) ? tree[l] : 0) +
			          ((r < branches + n) ? tree[r] : 0);
	};

	auto updb = [&tree, branches, n, upd](size_t i) {
		for (;;) {
			upd(i);
			if (i != 0u)
				i = (i - 1) / 2;
			else
				break;
		}
	};

	for (size_t i = branches; i > 0; --i)
		upd(i - 1);

	std::vector<ImageId> res(k, 0);

	for (ImageId &rei : res) {
		float x = real_dist(gen) * tree[0];
		size_t i = 0;
		for (;;) {
			const size_t l = 2 * i + 1;
			const size_t r = 2 * i + 2;

			// cout << "at i " << i << " x: " << x << " in tree: "
			// << tree[i] << endl;

			if (i >= branches)
				break;
			if (r < branches + n && x >= tree[l]) {
				x -= tree[l];
				i = r;
			} else
				i = l;
		}

		tree[i] = 0;
		updb(i);
		rei = ImageId(i - branches);
	}

	return res;
}

ImageId
ScoreModel::weighted_example(const std::vector<ImageId> &subset) const
{
	std::vector<float> fs(subset.size());
	for (size_t i = 0; i < subset.size(); ++i)
		fs[i] = _scores[subset[i]];

	std::random_device rd;
	std::mt19937 gen(rd());
	std::discrete_distribution<ImageId> dist(fs.begin(), fs.end());
	return subset[dist(gen)];
}

void
ScoreModel::apply_bayes(std::set<ImageId> likes,
                        const std::set<ImageId> &screen,
                        const DatasetFeatures &features)
{
	if (likes.empty())
		return;

	_cache_dirty = true;

	constexpr float Sigma = .1f;
	constexpr size_t max_others = 64;

	std::vector<ImageId> others;
	others.reserve(screen.size());
	for (ImageId id : screen)
		if (likes.count(id) == 0)
			others.push_back(id);

	if (others.size() > max_others) {
		// drop random overflow
		std::random_device rd;
		std::mt19937 gen(rd());
		std::uniform_int_distribution<size_t> rng;

		for (size_t i = 0; (i + 1) < max_others; ++i)
			std::swap(
			  others[i],
			  others[i + 1 + rng(gen) % (max_others - i - 1)]);

		others.resize(max_others);
	}

	auto start = std::chrono::high_resolution_clock::now();

	{
		size_t n_threads = std::thread::hardware_concurrency();
		std::vector<std::thread> threads(n_threads);

		auto worker = [&](size_t threadID) {
			const ImageId first =
			  ImageId(threadID * _scores.size() / n_threads);
			const ImageId last =
			  ImageId((threadID + 1) * _scores.size() / n_threads);

			for (ImageId ii = first; ii < last; ++ii) {
				float divSum = 0;

				for (ImageId oi : others)
					divSum +=
					  expf(-features.d_dot(ii, oi) / Sigma);

				for (auto &&like : likes) {
					const float likeValTmp = expf(
					  -features.d_dot(ii, like) / Sigma);
					_scores[ii] *=
					  likeValTmp / (likeValTmp + divSum);
				}
			}
		};
		for (size_t i = 0; i < threads.size(); ++i)
			threads[i] = std::thread(worker, i);
		for (auto &t : threads)
			t.join();
	}

	auto end = std::chrono::high_resolution_clock::now();
	std::chrono::duration<double> elapsed = end - start;
	debug("Bayes took " << elapsed.count());

	normalize();
}

void
ScoreModel::normalize()
{
	float smax = 0;

	for (float s : _scores)
		if (s > smax)
			smax = s;

	if (smax < MINIMAL_SCORE) {
		warn("all images have negligible score!");
		smax = MINIMAL_SCORE;
	}

	size_t n = 0;
	for (float &s : _scores) {
		s /= smax;
		if (s < MINIMAL_SCORE)
			++n, s = MINIMAL_SCORE;
	}
}

size_t
ScoreModel::frame_rank(ImageId i) const
{
	size_t rank{ 0 };
	float tar_score = _scores[i];
	for (float s : _scores) {
		if (s > tar_score)
			++rank;
	}
	return rank;
}
