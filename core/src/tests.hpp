
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

#include <stack>
#include <string>

#include "SomHunter.h"
#include "log.h"
#include "utils.h"

// What dataset
#define TESTING_ITEC_DATASET

// What keywords
#define TESTING_BOW_W2VV

class TESTER_SomHunter
{
public:
	static void run_all_tests(const std::string &cfg_fpth)
	{

		print("Initializing the SomHunter class tests...");

		// Parse config file
		auto config = Config::parse_json_config(cfg_fpth);

		// Instantiate the SOMHunter
		SomHunter core{ config };

		print("Running all the SomHunter class tests...");

		TEST_like_frames(core);
		TEST_autocomplete_keywords(core);

		print("If you got here, all tests were OK...");
	}

private:
	static void TEST_like_frames(SomHunter &core)
	{
		print("\t Testing `SomHunter::like_frames` method...");

		auto [disp,
		      likes]{ core.get_display(DisplayType::DTopN, 0, 0) };
		size_t size{ disp.size() };
		ASSERT(size > 0, "Top N display is empty!");

		auto ff = *(disp.begin());
		auto fm = *(disp.begin() + irand(1_z, size - 1));
		auto fl = *(--(disp.end()));

		using vec = std::vector<ImageId>;

		core.like_frames(vec{ ff->frame_ID });
		ASSERT(likes->count(ff->frame_ID) == 1,
		       "Frame SHOULD be liked.");
		core.like_frames(std::vector<ImageId>{ ff->frame_ID });
		ASSERT(likes->count(ff->frame_ID) == 0,
		       "Frame SHOULD NOT be liked.");

		core.like_frames(vec{ fm->frame_ID });
		ASSERT(likes->count(fm->frame_ID) == 1,
		       "Frame SHOULD be liked.");
		core.like_frames(std::vector<ImageId>{ fm->frame_ID });
		ASSERT(likes->count(fm->frame_ID) == 0,
		       "Frame SHOULD NOT be liked.");

		core.like_frames(vec{ fl->frame_ID });
		ASSERT(likes->count(fl->frame_ID) == 1,
		       "Frame SHOULD be liked.");
		core.like_frames(std::vector<ImageId>{ fl->frame_ID });
		ASSERT(likes->count(fl->frame_ID) == 0,
		       "Frame SHOULD NOT be liked.");

		vec all;
		for (auto &&f : disp) {
			all.emplace_back(f->frame_ID);
		}
		core.like_frames(all);
		ASSERT(likes->size() == size, "All frames SHOULD be liked.");

		core.like_frames(all);
		ASSERT(likes->size() == 0, "All frames SHOULD NOT be liked.");

		print("\t Testing `SomHunter::like_frames` finished.");
	}

	static void TEST_autocomplete_keywords(SomHunter &core)
	{
		print(
		  "\t Testing `SomHunter::autocomplete_keywords` method...");

		/*
		 * Non-empty cases
		 */
#ifdef TESTING_BOW_W2VV
		std::map<std::string, std::vector<KeywordId>> correct{
			{ "cat", { 44, 7725, 8225, 9712 } },
			{ "z", { 1615, 9127, 8767, 4316 } }
		};
#else
		std::vector<KeywordId> correct{};
		warn("No test values for this dataset.");
#endif
		for (auto &&[key, val] : correct) {
			auto ac_res{ core.autocomplete_keywords(key, 10) };

			for (size_t i{ 0 }; i < val.size(); ++i) {
				ASSERT(ac_res[i]->synset_ID == val[i],
				       "Incorrect keyword");
			}
		}

		/*
		 * Non-empty cases
		 */
		auto ac_res{ core.autocomplete_keywords("iax", 10) };
		ASSERT(ac_res.empty(), "Results should be empty!");

		ac_res = core.autocomplete_keywords("\\/?!,.'\"", 10);
		ASSERT(ac_res.empty(), "Results should be empty!");

		ac_res = core.autocomplete_keywords("cat", 0);
		ASSERT(ac_res.empty(), "Results should be empty!");

		ac_res = core.autocomplete_keywords("", 10);
		ASSERT(ac_res.empty(), "Results should be empty!");

		print(
		  "\t Testing `SomHunter::autocomplete_keywords` finished.");
	}
};