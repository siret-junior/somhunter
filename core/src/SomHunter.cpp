
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

#include <chrono>
#include <stdexcept>

#include "SomHunter.h"

#include "log.h"
#include "utils.h"

GetDisplayResult
SomHunter::get_display(DisplayType d_type,
                       ImageId selected_image,
                       PageId page,
                       bool log_it)
{
	search_ctx.submitter.poll();

	FramePointerRange frames{};

	switch (d_type) {
		case DisplayType::DRand:
			frames = get_random_display();
			break;

		case DisplayType::DTopN:
			frames = get_topn_display(page);
			break;

		case DisplayType::DTopNContext:
			frames = get_topn_context_display(page);
			break;

		case DisplayType::DSom:
			frames = get_som_display();
			break;

		case DisplayType::DVideoDetail:
			frames =
			  get_video_detail_display(selected_image, log_it);
			break;

		case DisplayType::DTopKNN:
			frames = get_topKNN_display(selected_image, page);
			break;

		default:
			warn("Unsupported display requested.");
#ifndef NDEBUG
			throw std::runtime_error(
			  "Unsupported display requested.");
#endif // !NDEBUG

			break;
	}

	return GetDisplayResult{ frames, &search_ctx.likes };
}

std::vector<bool>
SomHunter::like_frames(const std::vector<ImageId> &new_likes)
{
	search_ctx.submitter.poll();

	// Prepare the result flags vector
	std::vector<bool> res;
	res.reserve(new_likes.size());

	for (auto &&fr_ID : new_likes) {

		// Find the item in the set
		size_t count{ search_ctx.likes.count(fr_ID) };

		// If item is not present (NOT LIKED)
		if (count == 0) {
			// Like it
			search_ctx.likes.insert(fr_ID);
			res.emplace_back(true);

			search_ctx.submitter.log_like(frames,
			                              search_ctx.likes,
			                              search_ctx.curr_disp_type,
			                              fr_ID);
		}
		// If the item is present (LIKED)
		else {
			// Unlike it
			search_ctx.likes.erase(fr_ID);
			res.emplace_back(false);

			search_ctx.submitter.log_unlike(
			  frames,
			  search_ctx.likes,
			  search_ctx.curr_disp_type,
			  fr_ID);
		}
	}

	return res;
}

std::vector<const Keyword *>
SomHunter::autocomplete_keywords(const std::string &prefix, size_t count) const
{
	// Trivial case
	if (prefix.empty())
		return std::vector<const Keyword *>{};

	// Get the keywrods IDs
	auto kw_IDs{ keywords.find(prefix, count) };

	// Create vector of ptrs to corresponding keyword instances
	std::vector<const Keyword *> res;
	res.reserve(kw_IDs.size());
	for (auto &&kw_ID : kw_IDs) {
		res.emplace_back(&keywords[kw_ID.first]);
	}

	return res;
}

void
SomHunter::rescore(const std::string &text_query)
{
	search_ctx.submitter.poll();

	// Store likes for the logging purposees
	auto old_likes{ search_ctx.likes };

	// Rescore text query
	rescore_keywords(text_query);

	// Rescore relevance feedback
	rescore_feedback();

	// Start SOM computation
	som_start();

	// Update search context
	search_ctx.shown_images.clear();

	auto top_n = search_ctx.scores.top_n(frames,
	                                     TOPN_LIMIT,
	                                     config.topn_frames_per_video,
	                                     config.topn_frames_per_shot);

	// Reset likes
	search_ctx.likes.clear();

	debug("used_tools.topknn_used = " << used_tools.topknn_used);
	debug("used_tools.KWs_used = " << used_tools.KWs_used);
	debug("used_tools.bayes_used = " << used_tools.bayes_used);
	search_ctx.submitter.submit_and_log_rescore(
	  frames,
	  search_ctx.scores,
	  old_likes,
	  search_ctx.used_tools,
	  search_ctx.curr_disp_type,
	  top_n,
	  search_ctx.last_text_query,
	  config.topn_frames_per_video,
	  config.topn_frames_per_shot);
}

bool
SomHunter::som_ready() const
{
	return search_ctx.asyncSom.map_ready();
}

bool
SomHunter::login_to_dres() const
{
	return search_ctx.submitter.login_to_DRES();
}

void
SomHunter::submit_to_server(ImageId frame_id)
{
	search_ctx.submitter.submit_and_log_submit(
	  frames, search_ctx.curr_disp_type, frame_id);
}

void
SomHunter::reset_search_session()
{
	search_ctx.submitter.poll();

	reset_scores();
	search_ctx.submitter.log_reset_search();
	som_start();
}

void
SomHunter::log_video_replay(ImageId frame_ID, float delta_X)
{
	search_ctx.submitter.log_show_video_replay(frames, frame_ID, delta_X);
}

void
SomHunter::log_scroll(DisplayType t, float dir_Y)
{
	search_ctx.submitter.log_scroll(frames, t, dir_Y);
}

void
SomHunter::log_text_query_change(const std::string &text_query)
{
	search_ctx.submitter.log_text_query_change(text_query);
}

void
SomHunter::rescore_keywords(const std::string &query)
{
	// Do not rescore if query did not change
	if (search_ctx.last_text_query == query) {
		return;
	}

	reset_scores();

	keywords.rank_sentence_query(
	  query, search_ctx.scores, features, frames, config);

	search_ctx.last_text_query = query;
	search_ctx.used_tools.KWs_used = true;
}

void
SomHunter::rescore_feedback()
{
	if (search_ctx.likes.empty())
		return;

	search_ctx.scores.apply_bayes(
	  search_ctx.likes, search_ctx.shown_images, features);
	search_ctx.used_tools.bayes_used = true;
}

void
SomHunter::som_start()
{
	search_ctx.asyncSom.start_work(features, search_ctx.scores);
}

FramePointerRange
SomHunter::get_random_display()
{
	// Get ids
	auto ids = search_ctx.scores.weighted_sample(
	  DISPLAY_GRID_WIDTH * DISPLAY_GRID_HEIGHT, RANDOM_DISPLAY_WEIGHT);

	// Log
	search_ctx.submitter.log_show_random_display(frames, ids);
	// Update context
	for (auto id : ids)
		search_ctx.shown_images.insert(id);
	search_ctx.current_display = frames.ids_to_video_frame(ids);
	search_ctx.curr_disp_type = DisplayType::DRand;

	return FramePointerRange(search_ctx.current_display);
}

FramePointerRange
SomHunter::get_topn_display(PageId page)
{
	// Another display or first page -> load
	if (search_ctx.curr_disp_type != DisplayType::DTopN || page == 0) {
		debug("Loading top n display first page");
		// Get ids
		auto ids = search_ctx.scores.top_n(frames,
		                                   TOPN_LIMIT,
		                                   config.topn_frames_per_video,
		                                   config.topn_frames_per_shot);

		// Log only if page 0
		if (page == 0)
			search_ctx.submitter.log_show_topn_display(frames, ids);

		// Update context
		search_ctx.current_display = frames.ids_to_video_frame(ids);
		search_ctx.curr_disp_type = DisplayType::DTopN;
	}

	return get_page_from_last(page);
}

FramePointerRange
SomHunter::get_topn_context_display(PageId page)
{
	// Another display or first page -> load
	if (search_ctx.curr_disp_type != DisplayType::DTopNContext ||
	    page == 0) {
		debug("Loading top n context display first page");
		// Get ids
		auto ids = search_ctx.scores.top_n_with_context(
		  frames,
		  TOPN_LIMIT,
		  config.topn_frames_per_video,
		  config.topn_frames_per_shot);

		// Log
		if (page == 0)
			search_ctx.submitter.log_show_topn_context_display(
			  frames, ids);

		// Update context
		search_ctx.current_display = frames.ids_to_video_frame(ids);
		search_ctx.curr_disp_type = DisplayType::DTopNContext;
	}

	return get_page_from_last(page);
}

FramePointerRange
SomHunter::get_som_display()
{
	if (!search_ctx.asyncSom.map_ready()) {
		return FramePointerRange();
	}

	std::vector<ImageId> ids;
	ids.resize(SOM_DISPLAY_GRID_WIDTH * SOM_DISPLAY_GRID_HEIGHT);

	// Select weighted example from cluster
	for (size_t i = 0; i < SOM_DISPLAY_GRID_WIDTH; ++i) {
		for (size_t j = 0; j < SOM_DISPLAY_GRID_HEIGHT; ++j) {
			if (!search_ctx.asyncSom
			       .map(i + SOM_DISPLAY_GRID_WIDTH * j)
			       .empty()) {
				ImageId id = search_ctx.scores.weighted_example(
				  search_ctx.asyncSom.map(
				    i + SOM_DISPLAY_GRID_WIDTH * j));
				ids[i + SOM_DISPLAY_GRID_WIDTH * j] = id;
			}
		}
	}

	auto begin = std::chrono::steady_clock::now();
	// Fix empty cluster
	std::vector<size_t> stolen_count(
	  SOM_DISPLAY_GRID_WIDTH * SOM_DISPLAY_GRID_HEIGHT, 1);
	for (size_t i = 0; i < SOM_DISPLAY_GRID_WIDTH; ++i) {
		for (size_t j = 0; j < SOM_DISPLAY_GRID_HEIGHT; ++j) {
			if (search_ctx.asyncSom
			      .map(i + SOM_DISPLAY_GRID_WIDTH * j)
			      .empty()) {
				debug("Fixing cluster "
				      << i + SOM_DISPLAY_GRID_WIDTH * j);

				// Get SOM node of empty cluster
				auto k = search_ctx.asyncSom.get_koho(
				  i + SOM_DISPLAY_GRID_WIDTH * j);

				// Get nearest cluster with enough elements
				size_t clust = search_ctx.asyncSom
				                 .nearest_cluster_with_atleast(
				                   k, stolen_count);

				stolen_count[clust]++;
				std::vector<ImageId> ci =
				  search_ctx.asyncSom.map(clust);

				for (ImageId ii : ids) {
					auto fi =
					  std::find(ci.begin(), ci.end(), ii);
					if (fi != ci.end())
						ci.erase(fi);
				}

				assert(!ci.empty());

				ImageId id =
				  search_ctx.scores.weighted_example(ci);
				ids[i + SOM_DISPLAY_GRID_WIDTH * j] = id;
			}
		}
	}
	auto end = std::chrono::steady_clock::now();
	debug(
	  "Fixing clusters took "
	  << std::chrono::duration_cast<std::chrono::milliseconds>(end - begin)
	       .count()
	  << " [ms]");

	// Log
	search_ctx.submitter.log_show_som_display(frames, ids);

	// Update context
	for (auto id : ids) {
		if (id == IMAGE_ID_ERR_VAL)
			continue;

		search_ctx.shown_images.insert(id);
	}
	search_ctx.current_display = frames.ids_to_video_frame(ids);
	search_ctx.curr_disp_type = DisplayType::DSom;

	return FramePointerRange(search_ctx.current_display);
}

FramePointerRange
SomHunter::get_video_detail_display(ImageId selected_image, bool log_it)
{
	VideoId v_id = frames.get_video_id(selected_image);

	if (v_id == VIDEO_ID_ERR_VAL) {
		warn("Video for " << selected_image << " not found");
		return std::vector<VideoFramePointer>();
	}

	// Get ids
	FrameRange video_frames = frames.get_all_video_frames(v_id);

	// Log
	if (log_it)
		search_ctx.submitter.log_show_detail_display(frames,
		                                             selected_image);

	// Update context
	for (auto iter = video_frames.begin(); iter != video_frames.end();
	     ++iter) {
		search_ctx.shown_images.insert(iter->frame_ID);
	}

	search_ctx.current_display = frames.range_to_video_frame(video_frames);
	search_ctx.curr_disp_type = DisplayType::DVideoDetail;

	return FramePointerRange(search_ctx.current_display);
}

FramePointerRange
SomHunter::get_topKNN_display(ImageId selected_image, PageId page)
{
	// Another display or first page -> load
	if (search_ctx.curr_disp_type != DisplayType::DTopKNN || page == 0) {

		// Get ids
		auto ids = features.get_top_knn(frames,
		                                selected_image,
		                                config.topn_frames_per_video,
		                                config.topn_frames_per_shot);

		// Log only if the first page
		if (page == 0) {
			search_ctx.submitter.log_show_topknn_display(
			  frames, selected_image, ids);
		}

		// Update context
		search_ctx.current_display = frames.ids_to_video_frame(ids);
		search_ctx.curr_disp_type = DisplayType::DTopKNN;

		// KNN is query by example so we NEED to log a rerank
		UsedTools ut;
		ut.topknn_used = true;

		search_ctx.submitter.submit_and_log_rescore(
		  frames,
		  search_ctx.scores,
		  search_ctx.likes,
		  ut,
		  search_ctx.curr_disp_type,
		  ids,
		  search_ctx.last_text_query,
		  config.topn_frames_per_video,
		  config.topn_frames_per_shot);
	}

	return get_page_from_last(page);
}

FramePointerRange
SomHunter::get_page_from_last(PageId page)
{
	debug("Getting page "
	      << page << ", page size " << config.display_page_size
	      << ", current display size " << current_display.size());

	size_t begin_off{ std::min(search_ctx.current_display.size(),
		                   page * config.display_page_size) };
	size_t end_off{ std::min(search_ctx.current_display.size(),
		                 page * config.display_page_size +
		                   config.display_page_size) };

	FramePointerRange res(search_ctx.current_display.cbegin() + begin_off,
	                      search_ctx.current_display.cbegin() + end_off);

	// Update context
	for (auto iter = res.begin(); iter != res.end(); ++iter)
		// Skip "empty" frames
		if (*iter != nullptr)
			search_ctx.shown_images.insert((*iter)->frame_ID);

	return res;
}

void
SomHunter::reset_scores()
{
	search_ctx.used_tools.reset();

	search_ctx.shown_images.clear();

	// Reset likes
	search_ctx.likes.clear();

	search_ctx.last_text_query = "";

	search_ctx.scores.reset();
}
