

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

#ifndef SEARCH_CONTEXT_H_
#define SEARCH_CONTEXT_H_

#include <optional>
#include <string>
#include <vector>

#include "common.h"
#include "config_json.h"
#include "utils.h"

#include "DatasetFrames.h"
#include "Filters.h"
#include "RelevanceScores.h"

class DatasetFrames;
class DatasetFeatures;

/**
 * Represents exactly one momentary state of a search session.
 *
 * It can be ome point in HISTORY.
 */
class SearchContext
{
public:
	SearchContext() = delete;
	SearchContext(size_t ID, const Config& cfg, const DatasetFrames& frames);

	bool operator==(const SearchContext& other) const;

	void reset()
	{
		// Reset bookmarks
		bookmarks.clear();
		scores.reset_mask();
		reset_filters();
	}
	void reset_filters() { filters = Filters{}; }

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

	/** Frames selected as important. */
	BookmarksCont bookmarks;

	/** Frames that were seen since the last rescore. */
	ShownFramesCont shown_images;

	// Filepath to screenshot repesenting this screen
	std::string screenshot_fpth{};

	size_t ID;
	std::string label{ "" };

	/** Filters based on metadata (hour, weekday). */
	Filters filters;
};
#endif // SEARCH_CONTEXT_H_
