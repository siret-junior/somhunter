
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

// clang-format off

#include <stack>
#include <string>

#include "SomHunter.h"
#include "config_json.h"
#include "log.h"
#include "utils.h"

class TESTER_SomHunter
{
public:
	static void run_all_tests(const std::string &cfg_fpth)
	{
		print("====================================================");
		print("\tInitializing the `SomHunter` class tests...");
		print("====================================================");

		// Parse config file
		auto config = Config::parse_json_config(cfg_fpth);

		// Instantiate the SOMHunter
		SomHunter core{ config };

		print("Running all the SomHunter class tests...");

		TEST_like_frames(core);
		TEST_autocomplete_keywords(core);
		TEST_rescore(core);

		print("====================================================");
		print("\tIf you got here, all `SomHunter` tests were OK...");
		print("====================================================");
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
		ASSERT(likes.count(ff->frame_ID) == 1,
		       "Frame SHOULD be liked.");
		core.like_frames(std::vector<ImageId>{ ff->frame_ID });
		ASSERT(likes.count(ff->frame_ID) == 0,
		       "Frame SHOULD NOT be liked.");

		core.like_frames(vec{ fm->frame_ID });
		ASSERT(likes.count(fm->frame_ID) == 1,
		       "Frame SHOULD be liked.");
		core.like_frames(std::vector<ImageId>{ fm->frame_ID });
		ASSERT(likes.count(fm->frame_ID) == 0,
		       "Frame SHOULD NOT be liked.");

		core.like_frames(vec{ fl->frame_ID });
		ASSERT(likes.count(fl->frame_ID) == 1,
		       "Frame SHOULD be liked.");
		core.like_frames(std::vector<ImageId>{ fl->frame_ID });
		ASSERT(likes.count(fl->frame_ID) == 0,
		       "Frame SHOULD NOT be liked.");

		vec all;
		for (auto &&f : disp) {
			all.emplace_back(f->frame_ID);
		}
		core.like_frames(all);
		ASSERT(likes.size() == size, "All frames SHOULD be liked.");

		core.like_frames(all);
		ASSERT(likes.size() == 0, "All frames SHOULD NOT be liked.");

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

	static void TEST_rescore(SomHunter &core)
	{
		print("\t Testing `SomHunter::TEST_rescore` method...");

		FramePointerRange disp{};

		/*
		 * #1 Text
		 */
		auto h{ core.rescore("cat").history };
		auto state1{ core.user.ctx };
		ASSERT(h.back() == core.user.ctx, "Inconsistent data.");

#ifdef TESTING_ITEC_DATASET
		disp = core.get_display(DisplayType::DTopN, 0, 0).frames;
		ASSERT(disp[0]->frame_ID == 80,
		       "Incorrect frame in the display.");
		ASSERT(disp[1]->frame_ID == 130,
		       "Incorrect frame in the display.");
#endif

		/*
		 * #2 Temporal text
		 */
		core.like_frames(std::vector<ImageId>{ 0 });
		h = core.rescore("dog catalog >> habitat ").history;
		auto state2{ core.user.ctx };
		ASSERT(h.back() == core.user.ctx, "Inconsistent data.");

#ifdef TESTING_ITEC_DATASET
		disp = core.get_display(DisplayType::DTopN, 0, 0).frames;
		ASSERT(disp[0]->frame_ID == 25,
		       "Incorrect frame in the display.");
		ASSERT(disp[1]->frame_ID == 224,
		       "Incorrect frame in the display.");

		ASSERT(disp[7]->frame_ID == 588,
		       "Incorrect frame in the display.");
		ASSERT(disp[8]->frame_ID == 331,
		       "Incorrect frame in the display.");
#endif

		/*
		 * #3: Text & likes
		 */
		core.like_frames(std::vector<ImageId>{ 627 });
		core.like_frames(std::vector<ImageId>{ 601 });
		core.like_frames(std::vector<ImageId>{ 594 });
		h = core.rescore("chicken").history;
		auto state3{ core.user.ctx };
		ASSERT(h.back() == core.user.ctx, "Inconsistent data.");
		ASSERT(h.back().likes.size() == 0,
		       "Likes should be reset with rescore.");

#ifdef TESTING_ITEC_DATASET
		disp = core.get_display(DisplayType::DTopN, 0, 0).frames;
		ASSERT(disp[0]->frame_ID == 489,
		       "Incorrect frame in the display.");
		ASSERT(disp[1]->frame_ID == 462,
		       "Incorrect frame in the display.");

		ASSERT(disp[7]->frame_ID == 221,
		       "Incorrect frame in the display.");
		ASSERT(disp[8]->frame_ID == 224,
		       "Incorrect frame in the display.");
#endif

		/*
		 * #4: `conext_switch`
		 */
		core.switch_search_context(1);
		ASSERT(state1 == core.user.ctx, "State SHOULD BE equal.");
#ifdef TESTING_ITEC_DATASET
		disp = core.get_display(DisplayType::DTopN, 0, 0).frames;
		ASSERT(disp[0]->frame_ID == 80,
		       "Incorrect frame in the display.");
		ASSERT(disp[1]->frame_ID == 130,
		       "Incorrect frame in the display.");
#endif

		core.switch_search_context(2);
		ASSERT(state2 == core.user.ctx, "State SHOULD BE equal.");
#ifdef TESTING_ITEC_DATASET
		disp = core.get_display(DisplayType::DTopN, 0, 0).frames;
		ASSERT(disp[0]->frame_ID == 25,
		       "Incorrect frame in the display.");
		ASSERT(disp[1]->frame_ID == 224,
		       "Incorrect frame in the display.");

		ASSERT(disp[7]->frame_ID == 588,
		       "Incorrect frame in the display.");
		ASSERT(disp[8]->frame_ID == 331,
		       "Incorrect frame in the display.");
#endif

		core.switch_search_context(3);
		ASSERT(state3 == core.user.ctx, "State SHOULD BE equal.");
#ifdef TESTING_ITEC_DATASET
		disp = core.get_display(DisplayType::DTopN, 0, 0).frames;
		ASSERT(disp[0]->frame_ID == 489,
		       "Incorrect frame in the display.");
		ASSERT(disp[1]->frame_ID == 462,
		       "Incorrect frame in the display.");

		ASSERT(disp[7]->frame_ID == 221,
		       "Incorrect frame in the display.");
		ASSERT(disp[8]->frame_ID == 224,
		       "Incorrect frame in the display.");
#endif

		print("\t Testing `SomHunter::TEST_rescore` finished.");
	}
};

const char *json_contents = R"(
{
  "user_token": "admin",
  "submitter_config":{
		"submit_to_VBS": true,

		"submit_server": "dres",
		"server_config": {
		  "vbs": {
			"submit_interaction_URL": "http://herkules.ms.mff.cuni.cz:8080/vbs/query",
			"submit_rerank_URL": "http://herkules.ms.mff.cuni.cz:8080/vbs/result",
			"submit_URL": "http://herkules.ms.mff.cuni.cz:8080/vbs/submit"
		  },
		  "dres": {
			"submit_interaction_URL": "http://localhost:8080/log/query",
			"submit_rerank_URL": "http://localhost:8080/log/result",
			"submit_URL": "http://localhost:8080/submit",
			"cookie_file": "cookie.txt",
			"login_URL": "http://localhost:8080/api/login",
			"username": "admin",
			"password": "adminadmin"
			}
		},
	
		"team_ID": 4,
		"member_ID": 1,
	  
		"VBS_submit_archive_dir": "logs/submitted_logs/",
		"VBS_submit_archive_log_suffix": ".json",
		"extra_verbose_log": false,
	  
		"send_logs_to_server_period": 10000,
		"apply_log_action_timeout_in_core": false,
		"log_action_timeout": 500
	},

	"max_frame_filename_len": 64,
	"display_page_size": 128,
	"topn_frames_per_video": 3,
	"topn_frames_per_shot": 1,
	
	"filename_offsets": {
		"fr_filename_off": 6,
		"fr_filename_vid_ID_off": 7,
		"fr_filename_vid_ID_len": 5,
		"fr_filename_shot_ID_off": 14,
		"fr_filename_shot_ID_len": 5,
		"fr_filename_frame_num_off": 42,
		"fr_filename_frame_num_len": 8
	},

	"kws_file": "data/LSC2020_5days/word2idx.txt",
	"frames_path_prefix": "/images/LSC2020_5days/thumbs/",
	"frames_list_file": "data/LSC2020_5days/LSC-5days.keyframes.dataset",

	"features_file_data_off": 0,
	"features_dim": 128,
	"features_file": "data/LSC2020_5days/LSC-5days.w2vv.bin",
	
	"kw_bias_vec_file": "data/LSC2020_5days/txt_bias-2048floats.bin",
	"kw_scores_mat_file": "data/LSC2020_5days/txt_weight-11147x2048floats.bin",

	"kw_PCA_mat_dim": 128,
	"pre_PCA_features_dim": 2048,
	"kw_PCA_mean_vec_file": "data/LSC2020_5days/LSC-5days.w2vv.pca.mean.bin",
	"kw_PCA_mat_file": "data/LSC2020_5days/LSC-5days.w2vv.pca.matrix.bin",
	
    "LSC_metadata_file": "data/LSC2020_5days/lsc2020-metadata.csv"
  
}
)";

class TESTER_Config
{
public:
	static void run_all_tests(const std::string &cfg_fpth)
	{
		print("====================================================");
		print("\tInitializing the `Config` struct tests...");
		print("====================================================");

		// Parse config file
		Config config = Config::parse_json_config_string(json_contents);

		TEST_parse_json_config(config);
		TEST_LSC_addition(config);

		print("====================================================");
		print("\tIf you got here, all `Config` tests were OK...");
		print("====================================================");
	}

private:
	static void TEST_parse_json_config(const Config &c)
	{
		print("\t Testing `Config::parse_json_config`...");

		ASSERT(c.user_token == "admin", "Incorrect parse.");

		const auto &sbc{ c.submitter_config };
		ASSERT(sbc.submit_to_VBS == true, "Incorrect parse.");
		ASSERT(sbc.team_ID == 4_z, "Incorrect parse.");
		ASSERT(sbc.member_ID == 1_z, "Incorrect parse.");
		ASSERT(sbc.VBS_submit_archive_dir == "logs/submitted_logs/", "Incorrect parse.");
		ASSERT(sbc.VBS_submit_archive_log_suffix == ".json", "Incorrect parse.");
		ASSERT(sbc.extra_verbose_log == false, "Incorrect parse.");
		ASSERT(sbc.send_logs_to_server_period == 10000_z, "Incorrect parse.");
		ASSERT(sbc.apply_log_action_timeout == false, "Incorrect parse.");
		ASSERT(sbc.log_action_timeout == 500_z, "Incorrect parse.");
		ASSERT(sbc.server_type == "dres", "Incorrect parse.");

		const auto &sc{ std::get<ServerConfigDres>(c.submitter_config.server_cfg) };
		ASSERT(sc.submit_URL == "http://localhost:8080/submit", "Incorrect parse.");
		ASSERT(sc.submit_rerank_URL == "http://localhost:8080/log/result", "Incorrect parse.");
		ASSERT(sc.submit_interaction_URL == "http://localhost:8080/log/query", "Incorrect parse.");
		ASSERT(sc.cookie_file == "cookie.txt", "Incorrect parse.");
		ASSERT(sc.login_URL == "http://localhost:8080/api/login", "Incorrect parse.");
		ASSERT(sc.username == "admin", "Incorrect parse.");
		ASSERT(sc.password == "adminadmin", "Incorrect parse.");

		ASSERT(c.max_frame_filename_len == 64_z, "Incorrect parse.");

		ASSERT(c.filename_offsets.filename_off == 6_z, "Incorrect parse.");
		ASSERT(c.filename_offsets.vid_ID_off == 7_z,"Incorrect parse.");
		ASSERT(c.filename_offsets.vid_ID_len == 5_z, "Incorrect parse.");
		ASSERT(c.filename_offsets.shot_ID_off == 14_z, "Incorrect parse.");
		ASSERT(c.filename_offsets.shot_ID_len == 5_z, "Incorrect parse.");
		ASSERT(c.filename_offsets.frame_num_off == 42_z, "Incorrect parse.");
		ASSERT(c.filename_offsets.frame_num_len == 8_z, "Incorrect parse.");

		ASSERT(c.frames_list_file == "data/LSC2020_5days/LSC-5days.keyframes.dataset", "Incorrect parse.");
		ASSERT(c.frames_path_prefix == "/images/LSC2020_5days/thumbs/", "Incorrect parse.");
		ASSERT(c.features_file_data_off == 0_z, "Incorrect parse.");
		ASSERT(c.features_file == "data/LSC2020_5days/LSC-5days.w2vv.bin", "Incorrect parse.");
		ASSERT(c.features_dim == 128, "Incorrect parse.");

		ASSERT(c.pre_PCA_features_dim == 2048, "Incorrect parse.");
		ASSERT(c.kw_bias_vec_file == "data/LSC2020_5days/txt_bias-2048floats.bin", "Incorrect parse.");
		ASSERT(c.kw_scores_mat_file == "data/LSC2020_5days/txt_weight-11147x2048floats.bin", "Incorrect parse.");
		ASSERT(c.kw_PCA_mean_vec_file == "data/LSC2020_5days/LSC-5days.w2vv.pca.mean.bin", "Incorrect parse.");
		ASSERT(c.kw_PCA_mat_file == "data/LSC2020_5days/LSC-5days.w2vv.pca.matrix.bin", "Incorrect parse.");
		ASSERT(c.kw_PCA_mat_dim == 128, "Incorrect parse.");

		ASSERT(c.kws_file == "data/LSC2020_5days/word2idx.txt", "Incorrect parse.");

		ASSERT(c.display_page_size == 128_z, "Incorrect parse.");
		ASSERT(c.topn_frames_per_video == 3, "Incorrect parse.");
		ASSERT(c.topn_frames_per_shot == 1, "Incorrect parse.");

		print("\t Finishing `Config::parse_json_config`...");
	}

	static void TEST_LSC_addition(const Config &config)
	{
		print("\t Testing `Config::parse_json_config` for LSC changes...");

		ASSERT(config.LSC_metadata_file == "data/LSC2020_5days/lsc2020-metadata.csv", "Incorrect parse.");

		print("\t Finishing `Config::parse_json_config` for LSC changes...");
	}
};