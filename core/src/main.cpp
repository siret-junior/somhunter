
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
#include <stdio.h>
#include <thread>

#include "SomHunter.h"

// If the `TESTER_SomHunter` should do its job.
#define RUN_TESTER

#ifdef RUN_TESTER

/*
 * What dataset are we testing?
 *
 * *** TESTING_ITEC_DATASET ***:
 *	config.json:
 *		...
 *		"topn_frames_per_video": 3,
 *		"topn_frames_per_shot": 1,
 * 		...
 *
 * *** TESTING_LSC5DAYS_DATASET ***:
 *	config.json:
 *		...
 *		"topn_frames_per_video": 3,
 *		"topn_frames_per_shot": 1,
 * 		...
 *
 */
//#define TESTING_ITEC_DATASET
#define TESTING_LSC5DAYS_DATASET

/*
 * What keywords are we testing?
 *
 * *** TESTING_BOW_W2VV ***:
 */
#define TESTING_BOW_W2VV

#include "tests.hpp"

#endif

void
print_display(const FramePointerRange &d)
{
	for (auto iter = d.begin(); iter != d.end(); iter++)
		std::cout << (*iter)->frame_ID << std::endl;
}

int
main()
{
	/* Assuming root of your project is `build/src/` and your config
	   file lies in the server project root just above.

	   Change this accordingly. */
	const std::string cfg_fpth{ "../../../config.json" };

#ifdef RUN_TESTER
	TESTER_SomHunter::run_all_tests(cfg_fpth);
	TESTER_Config::run_all_tests(cfg_fpth);
#endif

#if 1
	// Parse config file
	auto config = Config::parse_json_config(cfg_fpth);

	// Instantiate the SOMHunter
	SomHunter core{ config };

	/*
	 * Test features here...
	 */
	debug("this is debug log");
	info("this is info log");
	warn("this is warn log");
	print("This is non-decorated plain STDOUT print.");

	// Try autocomplete
	auto ac_res{ core.autocomplete_keywords("cat", 30) };
	for (auto &&p_kw : ac_res) {
		std::cout << p_kw->synset_strs.front() << std::endl;
	}

	// Try different displays
	{
		core.rescore("dog park");

		auto [d_topn, l0] = core.get_display(DisplayType::DTopN, 0, 0);
		std::cout << "TOP N\n";
		print_display(d_topn);

		auto [d_topknn, l1] =
		  core.get_display(DisplayType::DTopKNN, 2, 0);
		std::cout << "TOP KNN\n";
		print_display(d_topknn);

		auto [d_rand, l2] = core.get_display(DisplayType::DRand);
		std::cout << "RANDOM\n";
		print_display(d_rand);
	}

	// Try keyword rescore
	{
		core.rescore("dog park");
		auto d_topn1 =
		  core.get_display(DisplayType::DTopN, 0, 0).frames;
		std::cout << "TOP N\n";
		print_display(d_topn1);
	}

	// Try reset session
	core.reset_search_session();

	// Try relevance feedback
	{
		auto d_rand1 = core.get_display(DisplayType::DRand).frames;
		std::vector<ImageId> likes;
		auto d_rand_b = d_rand1.begin();
		likes.push_back((*d_rand_b)->frame_ID);
		d_rand_b++;
		likes.push_back((*d_rand_b)->frame_ID);

		core.like_frames(likes);
		likes.resize(1);
		core.like_frames(likes);
		std::cout << "Like " << likes[0] << std::endl;

		core.rescore("\\/?!,.'\"");
	}

	{
		auto d_topn2 =
		  core.get_display(DisplayType::DTopN, 0, 0).frames;
		print_display(d_topn2);
		std::cout << "Len of top n page 0 " << d_topn2.size()
		          << std::endl;
	}
	{
		auto d_topn2 =
		  core.get_display(DisplayType::DTopN, 0, 1).frames;
		std::cout << "Len of top n page 1 " << d_topn2.size()
		          << std::endl;
	}
	{
		auto d_topn2 =
		  core.get_display(DisplayType::DTopN, 0, 2).frames;
		std::cout << "Len of top n page 2 " << d_topn2.size()
		          << std::endl;
	}

	// Try SOM
	{
		while (!core.som_ready()) {
			std::this_thread::sleep_for(
			  std::chrono::milliseconds(1000));
		}
		std::cout << "SOM is ready now!" << std::endl;

		auto d_som = core.get_display(DisplayType::DSom);
	}
#endif
	return 0;
}
