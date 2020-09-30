
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

#include "SearchContext.h"

#include "DatasetFeatures.h"
#include "DatasetFrames.h"

SearchContext::SearchContext(size_t ID,
                             const Config & /*cfg*/,
                             const DatasetFrames &frames)
  : ID(ID)
  , scores(frames)
{}

bool
SearchContext::operator==(const SearchContext &other) const
{
	return (ID == other.ID && used_tools == other.used_tools &&
	        current_display == other.current_display &&
	        curr_disp_type == other.curr_disp_type &&
	        scores == other.scores &&
	        last_text_query == other.last_text_query &&
	        likes == other.likes && shown_images == other.shown_images &&
	        screenshot_fpth == other.screenshot_fpth);
}