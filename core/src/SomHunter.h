
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

#ifndef somhunter_h
#define somhunter_h

#include <array>
#include <set>
#include <string>
#include <vector>

#include "AsyncSom.h"
#include "DatasetFeatures.h"
#include "DatasetFrames.h"
#include "KeywordRanker.h"
#include "RelevanceScores.h"
#include "Submitter.h"

class TESTER_SomHunter;

class WeekDaysFilter
{
public:
	/** Default state is all dayes */
	WeekDaysFilter() { _days.fill(true); }

	const bool &operator[](size_t i) const { return _days[i]; }

	bool &operator[](size_t i) { return _days[i]; }

private:
	std::array<bool, 7> _days;
};

class TimeFilter
{
public:
	/** Default state is the whole day */
	TimeFilter()
	  : from(0)
	  , to(24){};
	TimeFilter(Hour from, Hour to)
	  : from(from)
	  , to(to){};

	Hour from;
	Hour to;
};

/** Container for all the available filters for the rescore */
struct Filters
{
	TimeFilter time;
	WeekDaysFilter days;
};

using LikesCont = std::set<ImageId>;
using ShownFramesCont = std::set<ImageId>;

/**
 * Represents exactly one momentary state of a search session.
 *
 * It can be ome point in HISTORY.
 */
class SearchContext
{
public:
	SearchContext() = delete;
	SearchContext(size_t ID,
	              const Config &cfg,
	              const DatasetFrames &frames,
	              const DatasetFeatures &features);

	bool operator==(const SearchContext &other) const;

public:
	// VBS logging
	UsedTools used_tools;

	// Current display context
	std::vector<VideoFramePointer> current_display;
	DisplayType curr_disp_type{ DisplayType::DNull };

	// Relevance scores
	ScoreModel scores;

	// Used keyword query
	std::string last_text_query;

	// Relevance feedback context
	LikesCont likes;
	ShownFramesCont shown_images;

	// Filepath to screenshot repesenting this screen
	std::string screenshot_fpth{};

	size_t ID;
	std::string label{ "" };
};

/** Represents exactly one state of ONE user that uses this core. */
class UserContext
{
public:
	UserContext() = delete;
	UserContext(const std::string &user_token,
	            const Config &cfg,
	            const DatasetFrames &frames,
	            const DatasetFeatures features);

	bool operator==(const UserContext &other) const;

public:
	// *** SEARCH CONTEXT ***
	SearchContext ctx;

	// *** USER SPECIFIC ***
	std::string user_token;
	std::vector<SearchContext> history;
	Submitter submitter;
	AsyncSom async_SOM;
};

/** Result type `get_display` returns */
struct GetDisplayResult
{
	FramePointerRange frames;
	const LikesCont &likes;
};

/** Result type `rescore` returns */
struct RescoreResult
{
	size_t curr_ctx_ID;
	const std::vector<SearchContext> &history;
};

/* This is the main backend class. */
class SomHunter
{
	// *** LOADED DATASET ***
	const DatasetFrames frames;
	const DatasetFeatures features;
	const KeywordRanker keywords;
	const Config config;

	// *** USER CONTEXT ***
	UserContext user; // This will become std::vector<UserContext>

public:
	SomHunter() = delete;
	/** The main ctor with the config from the JSON config file. */
	inline SomHunter(const Config &cfg)
	  : config(cfg)
	  , frames(cfg)
	  , features(frames, cfg)
	  , keywords(cfg, frames)
	  , user(cfg.user_token, cfg, frames, features)
	{}

	/**
	 * Returns display of desired type
	 *
	 *	Some diplays may even support paging (e.g. top_n) or
	 * selection of one frame (e.g. top_knn)
	 */
	GetDisplayResult get_display(DisplayType d_type,
	                             ImageId selected_image = 0,
	                             PageId page = 0,
	                             bool log_it = true);

	/** Inverts the like states of the provided frames and returns the new
	 * states. */
	std::vector<bool> like_frames(const std::vector<ImageId> &likes);

	/** Returns the nearest supported keyword matches to the provided
	 * prefix. */
	std::vector<const Keyword *> autocomplete_keywords(
	  const std::string &prefix,
	  size_t count) const;

	/**
	 * Applies all algorithms for score computation and updates context.
	 *
	 * Returns references to existing history states that we can go back to
	 * (including the current one).
	 */
	RescoreResult rescore(const std::string &text_query,
	                      Filters filters = Filters{},
	                      size_t src_search_ctx_ID = SIZE_T_ERR_VAL,
	                      const std::string &screenshot_fpth = ""s,
	                      const std::string &label = ""s);

	/** Switches the search context for the user to the provided index in
	 *  the history and returns reference to it.
	 *
	 * To be extended with the `user_token` argument with multiple users
	 * support.
	 */
	const UserContext &switch_search_context(
	  size_t index,
	  size_t src_search_ctx_ID = SIZE_T_ERR_VAL,
	  const std::string &screenshot_fpth = "",
	  const std::string &label = "");

	void apply_filters(const Filters &filters);

	/**
	 * Returns a reference to the current user's search context.
	 *
	 * To be extended with the `user_token` argument with multiple users
	 * support.
	 */
	const SearchContext &get_search_context() const;

	/**
	 * Returns a reference to the current user's context.
	 *
	 * To be extended with the `user_token` argument with multiple users
	 * support.
	 */
	const UserContext &get_user_context() const;

	/** Returns true if the user's SOM is ready */
	bool som_ready() const;

	/**
	 * Tries to login into the DRES evaluation server
	 *		https://github.com/lucaro/DRES
	 */
	bool login_to_dres() const;

	/** Sumbits frame with given id to VBS server */
	void submit_to_server(ImageId frame_id);

	/** Resets current search context and starts new search */
	void reset_search_session();

	/*
	 * Log events that need to be triggered from the outside (e.g. the UI).
	 */
	void log_video_replay(ImageId frame_ID, float delta_X);
	void log_scroll(DisplayType t, float delta_Y);
	void log_text_query_change(const std::string &text_query);

private:
	/**
	 *	Applies text query from the user.
	 */
	void rescore_keywords(const std::string &query);

	/**
	 *	Applies feedback from the user based
	 * on shown_images.
	 */
	void rescore_feedback();

	/**
	 *	Gives SOM worker new work.
	 */
	void som_start();

	FramePointerRange get_random_display();

	FramePointerRange get_topn_display(PageId page);

	FramePointerRange get_topn_context_display(PageId page);

	FramePointerRange get_som_display();

	FramePointerRange get_video_detail_display(ImageId selected_image,
	                                           bool log_it = true);

	FramePointerRange get_topKNN_display(ImageId selected_image,
	                                     PageId page);

	// Gets only part of last display
	FramePointerRange get_page_from_last(PageId page);

	void reset_scores();

	/** Adds currently active search context to the history and starts a new
	 * context (with next contiguous ID number) */
	void push_search_ctx()
	{
		// Make sure we're not pushing in any old screenshot
		user.ctx.screenshot_fpth = "";

		// Increment context ID
		user.ctx.ID = user.history.size();
		user.history.emplace_back(user.ctx);
	}

	/** Resets the current history and search session and starts new history
	 * (from ID 0) */
	void reset_search_history()
	{
		// Make sure we're not pushing in any old screenshot
		user.ctx.screenshot_fpth = "";

		user.ctx.ID = 0;
		user.history.clear();
		user.history.emplace_back(user.ctx);
	}

	/** The tester class */
	friend TESTER_SomHunter;
};

#endif
