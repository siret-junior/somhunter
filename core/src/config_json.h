
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
#ifndef CONFIG_JSON_H_
#define CONFIG_JSON_H_

#include <fstream>
#include <stdexcept>
#include <string>
#include <variant>

#include "json11.hpp"

#include "log.h"
#include "utils.h"

struct VideoFilenameOffsets
{
	size_t filename_off;
	size_t vid_ID_off;
	size_t vid_ID_len;
	size_t shot_ID_off;
	size_t shot_ID_len;
	size_t frame_num_off;
	size_t frame_num_len;
};

/** Config for submitting to the older server.
 *
 * https://github.com/klschoef/vbsserver/
 */
struct ServerConfigVbs
{
	std::string submit_URL;
	std::string submit_rerank_URL;
	std::string submit_interaction_URL;
};

/** Config for submitting to the DRES server.
 *
 * https://github.com/lucaro/DRES
 */
struct ServerConfigDres
{
	std::string submit_URL;
	std::string submit_rerank_URL;
	std::string submit_interaction_URL;

	std::string cookie_file;

	std::string login_URL;
	std::string username;
	std::string password;
};

using ServerConfig = std::variant<ServerConfigVbs, ServerConfigDres>;

/** Config needed by the Submitter instance.
 *
 * \see ServerConfig
 * \see ServerConfigVbs
 * \see ServerConfigDres
 */
struct SubmitterConfig
{
	/** If submit actions will create actual HTTP request */
	bool submit_to_VBS;

	ServerConfig server_cfg;

	size_t team_ID;
	size_t member_ID;

	std::string VBS_submit_archive_dir;
	std::string VBS_submit_archive_log_suffix;
	bool extra_verbose_log;

	size_t send_logs_to_server_period;
	bool apply_log_action_timeout;
	size_t log_action_timeout;
};

/** Parsed current config of the core.
 * \see ParseJsonConfig
 */
struct Config
{
	SubmitterConfig submitter_config;

	size_t max_frame_filename_len;
	VideoFilenameOffsets filename_offsets;

	std::string frames_list_file;
	std::string frames_path_prefix;

	size_t features_file_data_off;
	std::string features_file;
	size_t features_dim;

	size_t pre_PCA_features_dim;
	std::string kw_bias_vec_file;
	std::string kw_scores_mat_file;
	std::string kw_PCA_mean_vec_file;
	std::string kw_PCA_mat_file;
	size_t kw_PCA_mat_dim;

	std::string kws_file;

	size_t display_page_size;
	size_t topn_frames_per_video;
	size_t topn_frames_per_shot;

	static Config parse_json_config(const std::string &filepath);

private:
	static SubmitterConfig parse_submitter_config(const json11::Json &json);
	static ServerConfigVbs parse_vbs_config(const json11::Json &json);
	static ServerConfigDres parse_dres_config(const json11::Json &json);
};

/** Parsees the JSON config file that holds initial config.
 *
 * That means basically what we have in config.h now (paths etc.)
 */
inline Config
Config::parse_json_config(const std::string &filepath)
{
	std::ifstream ifs{ filepath };
	if (!ifs.is_open()) {
		std::string msg{ "Error opening file: " + filepath };
		warn(msg);
		throw std::runtime_error(msg);
	}

	// Rad the whole file
	ifs.seekg(0, std::ios::end);
	size_t size = ifs.tellg();

	std::string cfg_file_contents(size, ' ');

	ifs.seekg(0);
	ifs.read(&cfg_file_contents[0], size);

	std::string err;
	auto json{ json11::Json::parse(cfg_file_contents, err) };

	if (!err.empty()) {
		std::string msg{ "Error parsing JSON config file: " +
			         filepath };
		warn(msg);
		throw std::runtime_error(msg);
	}

	auto cfg = Config{
		parse_submitter_config(json["submitter_config"]),

		size_t(json["max_frame_filename_len"].int_value()),

		VideoFilenameOffsets{
		  size_t(
		    json["filename_offsets"]["fr_filename_off"].int_value()),
		  size_t(json["filename_offsets"]["fr_filename_vid_ID_off"]
		           .int_value()),
		  size_t(json["filename_offsets"]["fr_filename_vid_ID_len"]
		           .int_value()),
		  size_t(json["filename_offsets"]["fr_filename_shot_ID_off"]
		           .int_value()),
		  size_t(json["filename_offsets"]["fr_filename_shot_ID_len"]
		           .int_value()),
		  size_t(json["filename_offsets"]["fr_filename_frame_num_off"]
		           .int_value()),
		  size_t(json["filename_offsets"]["fr_filename_frame_num_len"]
		           .int_value()),
		},

		json["frames_list_file"].string_value(),
		json["frames_path_prefix"].string_value(),

		size_t(json["features_file_data_off"].int_value()),
		json["features_file"].string_value(),
		size_t(json["features_dim"].int_value()),

		size_t(json["pre_PCA_features_dim"].int_value()),
		json["kw_bias_vec_file"].string_value(),
		json["kw_scores_mat_file"].string_value(),
		json["kw_PCA_mean_vec_file"].string_value(),
		json["kw_PCA_mat_file"].string_value(),
		size_t(json["kw_PCA_mat_dim"].int_value()),

		json["kws_file"].string_value(),

		size_t(json["display_page_size"].int_value()),
		size_t(json["topn_frames_per_video"].int_value()),
		size_t(json["topn_frames_per_shot"].int_value()),
	};

	return cfg;
}

inline SubmitterConfig
Config::parse_submitter_config(const json11::Json &json)
{
	SubmitterConfig res;

	res.submit_to_VBS = json["submit_to_VBS"].bool_value();

	res.team_ID = size_t(json["team_ID"].int_value());
	res.member_ID = size_t(json["member_ID"].int_value());

	res.VBS_submit_archive_dir =
	  json["VBS_submit_archive_dir"].string_value();
	res.VBS_submit_archive_log_suffix =
	  json["VBS_submit_archive_log_suffix"].string_value();
	res.extra_verbose_log = json["extra_verbose_log"].bool_value();

	res.send_logs_to_server_period =
	  size_t(json["send_logs_to_server_period"].int_value());

	res.apply_log_action_timeout =
	  json["apply_log_action_timeout_in_core"].bool_value();
	res.log_action_timeout = size_t(json["log_action_timeout"].int_value());

	// Parse a type of the submit server
	std::string server_type{ json["submit_server"].string_value() };

	// Parse the correct JSON format based on the server type
	if (server_type == "vbs") {
		res.server_cfg =
		  parse_vbs_config(json["server_config"][server_type]);
	} else if (server_type == "dres") {
		res.server_cfg =
		  parse_dres_config(json["server_config"][server_type]);
	}
	// If error value
	else {
#ifndef NDEBUG
		std::string msg{ "Uknown submit server type: " + server_type };
		warn(msg);
		throw std::runtime_error(msg);
#endif
	}

	return res;
}

inline ServerConfigVbs
Config::parse_vbs_config(const json11::Json &json)
{
	return ServerConfigVbs{ json["submit_URL"].string_value(),
		                json["submit_rerank_URL"].string_value(),
		                json["submit_interaction_URL"].string_value() };
}

inline ServerConfigDres
Config::parse_dres_config(const json11::Json &json)
{
	return ServerConfigDres{ json["submit_URL"].string_value(),
		                 json["submit_rerank_URL"].string_value(),
		                 json["submit_interaction_URL"].string_value(),

		                 json["cookie_file"].string_value(),

		                 json["login_URL"].string_value(),
		                 json["username"].string_value(),
		                 json["password"].string_value() };
}

#endif // CONFIG_JSON_H_
