
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

		print("If you got here, all tests were OK...");
	}

private:
	static void TEST_like_frames(SomHunter &core)
	{
		print("\t Testing `SomHunter::like_frames` method...");

		auto disp{ core.get_display(DisplayType::DTopN, 0, 0) };
		size_t size{ disp.size() };
		ASSERT(size > 0, "Top N display is empty!");

		auto ff = *(disp.begin());
		auto fm = *(disp.begin() + irand(1_z, size - 1));
		auto fl = *(--(disp.end()));

		using vec = std::vector<ImageId>;

		core.like_frames(vec{ ff->frame_ID });
		ASSERT(core.likes.count(ff->frame_ID) == 1,
		       "Frame SHOULD be liked.");
		core.like_frames(std::vector<ImageId>{ ff->frame_ID });
		ASSERT(core.likes.count(ff->frame_ID) == 0,
		       "Frame SHOULD NOT be liked.");

		core.like_frames(vec{ fm->frame_ID });
		ASSERT(core.likes.count(fm->frame_ID) == 1,
		       "Frame SHOULD be liked.");
		core.like_frames(std::vector<ImageId>{ fm->frame_ID });
		ASSERT(core.likes.count(fm->frame_ID) == 0,
		       "Frame SHOULD NOT be liked.");

		core.like_frames(vec{ fl->frame_ID });
		ASSERT(core.likes.count(fl->frame_ID) == 1,
		       "Frame SHOULD be liked.");
		core.like_frames(std::vector<ImageId>{ fl->frame_ID });
		ASSERT(core.likes.count(fl->frame_ID) == 0,
		       "Frame SHOULD NOT be liked.");

		vec all;
		for (auto &&f : disp) {
			all.emplace_back(f->frame_ID);
		}
		core.like_frames(all);
		ASSERT(core.likes.size() == size,
		       "All frames SHOULD be liked.");

		core.like_frames(all);
		ASSERT(core.likes.size() == 0,
		       "All frames SHOULD NOT be liked.");
	}
};