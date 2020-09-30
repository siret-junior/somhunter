
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

#ifndef COMMON_H_
#define COMMON_H_

#include <cstdint>
#include <limits>
#include <set>
#include <string>
#include <vector>

// some types
using KeywordId = size_t;
using KeywordIds = std::vector<KeywordId>;
using KwSearchId = std::pair<KeywordId, size_t>;
using KwSearchIds = std::vector<KwSearchId>;
using KwDescription = std::string;

// wordnet IDs
using SynsetId = size_t;
using SynsetStrings = std::vector<std::string>;
using SynsetIds = std::vector<SynsetId>;

using VideoId = unsigned;
using FrameNum = unsigned;
using ShotId = unsigned;

using ImageId = unsigned long;
using ScreenImgsCont = std::vector<ImageId>;
using FeatureMatrix = std::vector<std::vector<float>>;
using FeatureVector = std::vector<float>;

using LikesCont = std::set<ImageId>;
using BookmarksCont = std::set<ImageId>;
using ShownFramesCont = std::set<ImageId>;

#define SIZE_T_ERR_VAL (std::numeric_limits<size_t>::max)()
#define IMAGE_ID_ERR_VAL (std::numeric_limits<ImageId>::max)()
#define VIDEO_ID_ERR_VAL (std::numeric_limits<VideoId>::max)()

/** Value indicating error/invalid/"NULL" value for the given type. */
template<typename T>
constexpr T
ERR_VAL()
{
	return std::numeric_limits<T>::max();
}

enum class DisplayType
{
	DNull,
	DTopKNN,
	DLoading,
	DSom,
	DEmbed,
	DTopN,
	DTopNContext,
	DRand,
	DVideoDetail,
	DVideoReplay,
	NumItems
};

inline DisplayType
str_to_disp_type(const std::string &type_str)
{
	/* !!! THIS MUST MATCH WITH `config/strings.json` FILE !!! */
	if (type_str == "topn_display")
		return DisplayType::DTopN;
	if (type_str == "topn_context_display")
		return DisplayType::DTopNContext;
	if (type_str == "SOM_display")
		return DisplayType::DSom;
	if (type_str == "topknn_display")
		return DisplayType::DTopKNN;
	if (type_str == "video_detail")
		return DisplayType::DVideoDetail;
	if (type_str == "video_replay")
		return DisplayType::DVideoReplay;

	return DisplayType::NumItems;
}

inline std::string
disp_type_to_str(DisplayType type)
{
	std::string disp_type;
	switch (type) {
		case DisplayType::DTopN:
			disp_type = "topn_display";
			break;

		case DisplayType::DTopNContext:
			disp_type = "topn_context_display";
			break;

		case DisplayType::DSom:
			disp_type = "SOM_display";
			break;

		case DisplayType::DTopKNN:
			disp_type = "topknn_display";
			break;

		case DisplayType::DVideoDetail:
			disp_type = "video_detail";
			break;

		case DisplayType::DVideoReplay:
			disp_type = "video_replay";
			break;
	}

	return disp_type;
}

/*!
 * User defined size literal.
 */
constexpr size_t operator""_z(unsigned long long int x)
{
	return static_cast<size_t>(x);
}

/** What tools has been used during current search session.
 *  We need to send this info to logs.
 */
struct UsedTools
{
	bool operator==(const UsedTools &other) const
	{
		return (KWs_used == other.KWs_used &&
		        bayes_used == other.bayes_used &&
		        topknn_used == other.topknn_used);
	}
	UsedTools()
	  : KWs_used(false)
	  , bayes_used(false)
	  , topknn_used(false)
	{}

	void reset()
	{
		KWs_used = false;
		bayes_used = false;
		topknn_used = false;
	}

	bool KWs_used;
	bool bayes_used;
	bool topknn_used;
};

struct SubmitData
{
	SubmitData()
	  : want_submit(false)
	  , frame_ID(IMAGE_ID_ERR_VAL)

	{}

	bool push_submit(ImageId fr_ID)
	{
		// If we're busy, notify caller
		if (want_submit)
			return false;

		want_submit = true;
		frame_ID = fr_ID;
		return true;
	}

	ImageId get_and_pop_submit()
	{
		want_submit = false;
		return frame_ID;
	}

	bool submit_requested() const { return want_submit; }

	bool want_submit;
	ImageId frame_ID;
};

using PageId = unsigned;

using Weekday = uint8_t;
using Hour = uint8_t;

#endif // COMMON_H_
