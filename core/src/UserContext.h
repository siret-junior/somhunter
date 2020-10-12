

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

#ifndef USER_CONTEXT_H_
#define USER_CONTEXT_H_

#include <optional>
#include <vector>

#include "common.h"

#include "AsyncSom.h"
#include "SearchContext.h"
#include "Submitter.h"

class DatasetFrames;
class DatasetFeatures;

/** Represents exactly one state of ONE user that uses this core. */
class UserContext
{
public:
	UserContext() = delete;
	UserContext(const std::string& user_token,
	            const Config& cfg,
	            const DatasetFrames& frames,
	            const DatasetFeatures features);

	bool operator==(const UserContext& other) const;
	void reset()
	{
		// Reset SearchContext
		ctx.reset();
		// Make sure we're not pushing in any old screenshot
		ctx.screenshot_fpth = "";
		ctx.ID = 0;

		// Reset bookmarks
		bookmarks.clear();

		history.clear();
		history.emplace_back(ctx);
	}

public:
	// *** SEARCH CONTEXT ***
	SearchContext ctx;

	// *** USER SPECIFIC ***
	std::string user_token;
	std::vector<SearchContext> history;

	Submitter submitter;
	AsyncSom async_SOM;

	/** Frames selected as important. */
	BookmarksCont bookmarks;
};

/** Result type `get_display` returns */
struct GetDisplayResult
{
	FramePointerRange frames;
	const LikesCont& likes;
	const LikesCont& bookmarks;
};

/** Result type `rescore` returns */
struct RescoreResult
{
	size_t curr_ctx_ID;
	const std::vector<SearchContext>& history;
};

#endif // USER_CONTEXT_H_
