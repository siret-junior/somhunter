
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

#include "Submitter.h"

#include <filesystem>
#include <fstream>
#include <memory>

#include <curl/curl.h>

#ifdef DEBUG_CURL_REQUESTS

static void
curl_dump(const char *text,
          FILE *stream,
          unsigned char *ptr,
          size_t size,
          char nohex)
{
	size_t i;
	size_t c;

	unsigned int width = 0x10;

	if (nohex)
		/* without the hex output, we can fit more on screen */
		width = 0x40;

	fprintf(stream,
	        "%s, %10.10lu bytes (0x%8.8lx)\n",
	        text,
	        (unsigned long)size,
	        (unsigned long)size);

	for (i = 0; i < size; i += width) {

		fprintf(stream, "%4.4lx: ", (unsigned long)i);

		if (!nohex) {
			/* hex not disabled, show it */
			for (c = 0; c < width; c++)
				if (i + c < size)
					fprintf(stream, "%02x ", ptr[i + c]);
				else
					fputs("   ", stream);
		}

		for (c = 0; (c < width) && (i + c < size); c++) {
			/* check for 0D0A; if found, skip past and start a new
			 * line of output */
			if (nohex && (i + c + 1 < size) && ptr[i + c] == 0x0D &&
			    ptr[i + c + 1] == 0x0A) {
				i += (c + 2 - width);
				break;
			}
			fprintf(stream,
			        "%c",
			        (ptr[i + c] >= 0x20) && (ptr[i + c] < 0x80)
			          ? ptr[i + c]
			          : '.');
			/* check again for 0D0A, to avoid an extra \n if it's at
			 * width */
			if (nohex && (i + c + 2 < size) &&
			    ptr[i + c + 1] == 0x0D && ptr[i + c + 2] == 0x0A) {
				i += (c + 3 - width);
				break;
			}
		}
		fputc('\n', stream); /* newline */
	}
	fflush(stream);
}

static int
trace_fn(CURL *handle, curl_infotype type, char *dt, size_t size, void *userp)
{
	struct data *config = (struct data *)userp;
	const char *text;

	switch (type) {
		case CURLINFO_TEXT:
			std::cout << dt << std::endl;
			return 0;
			break;
		case CURLINFO_HEADER_OUT:
			text = "=> Send header";
			break;
		case CURLINFO_DATA_OUT:
			text = "=> Send data";
			break;
		case CURLINFO_SSL_DATA_OUT:
			text = "=> Send SSL data";
			break;
		case CURLINFO_HEADER_IN:
			text = "<= Recv header";
			break;
		case CURLINFO_DATA_IN:
			text = "<= Recv data";
			break;
		case CURLINFO_SSL_DATA_IN:
			text = "<= Recv SSL data";
			break;
	}

	curl_dump(text, stderr, (unsigned char *)dt, size, 0);
	return 0;
}

#endif // DEBUG_CURL_REQUESTS

static size_t
res_cb(char *contents, size_t size, size_t nmemb, void *userp)
{
	static_cast<std::string *>(userp)->append(contents, size * nmemb);
	return size * nmemb;
}

static void
poster_thread(const std::string &submit_url,
              const std::string &query,
              const std::string &data,
              bool &finished,
              const SubmitterConfig &cfg)
{
	/*
	 * write the stuff into a file just to be sure and have it nicely
	 * archived
	 */

	if (!std::filesystem::is_directory(cfg.VBS_submit_archive_dir))
		std::filesystem::create_directories(cfg.VBS_submit_archive_dir);

	if (!std::filesystem::is_directory(cfg.VBS_submit_archive_dir))
		warn("wtf, directory was not created");

	{
		std::string path = cfg.VBS_submit_archive_dir +
		                   std::string("/") +
		                   std::to_string(timestamp()) +
		                   cfg.VBS_submit_archive_log_suffix;
		std::ofstream o(path.c_str(), std::ios::app);
		if (!o) {
			warn("Could not write a log file!");
		} else {
			// Only print this if not empty
			if (!data.empty())
				o << data << std::endl;
		}
	}

	if (cfg.extra_verbose_log) {

		// Subtract ',' to '\n'
		std::string data_not_so_pretty_fmtd(data);
		std::replace(data_not_so_pretty_fmtd.begin(),
		             data_not_so_pretty_fmtd.end(),
		             ',',
		             '\n');
		std::replace(data_not_so_pretty_fmtd.begin(),
		             data_not_so_pretty_fmtd.end(),
		             '{',
		             '\n');

		if (data_not_so_pretty_fmtd.length() > 200) {
			data_not_so_pretty_fmtd[200] = '\0';
		}

		if (cfg.extra_verbose_log) {
			std::cout << "**********************" << std::endl
			          << "POST '" << submit_url
			          << "' request: " << query << std::endl
			          << "body: " << data_not_so_pretty_fmtd
			          << std::endl
			          << "**********************" << std::endl;
		}
	}

	if (cfg.submit_to_VBS) {
		CURL *curl = curl_easy_init();
		std::string res_buffer;

#ifdef DEBUG_CURL_REQUESTS

		curl_easy_setopt(curl, CURLOPT_DEBUGFUNCTION, trace_fn);
		curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L);

#endif // DEBUG_CURL_REQUESTS

		curl_easy_setopt(curl, CURLOPT_HEADER, 0);
		curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1);
		curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 30);

		std::string url = submit_url;
		url += "?" + query;
		curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
		curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "POST");

		curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data.c_str());
		curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, data.length());

		static std::string hdr = "Content-type: application/json";
		static struct curl_slist reqheader = { hdr.data(), nullptr };
		curl_easy_setopt(curl, CURLOPT_HTTPHEADER, &reqheader);

		curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, res_cb);
		curl_easy_setopt(curl, CURLOPT_WRITEDATA, &res_buffer);

		// If DRES server
		if (std::holds_alternative<ServerConfigDres>(cfg.server_cfg)) {
			auto s_cfg{ std::get<ServerConfigDres>(
			  cfg.server_cfg) };

			curl_easy_setopt(
			  curl, CURLOPT_COOKIEFILE, s_cfg.cookie_file.c_str());
			curl_easy_setopt(
			  curl, CURLOPT_COOKIEJAR, s_cfg.cookie_file.c_str());
		}

		auto res = curl_easy_perform(curl);

		if (res == CURLE_OK) {
			info("GET request OK: " << url);
		} else {
			warn("GET request failed with cURL error: "
			     << curl_easy_strerror(res));
		}

		if (cfg.extra_verbose_log) {
			std::cout << std::endl
			          << "RESPONSE:" << std::endl
			          << res_buffer << std::endl
			          << "**********************" << std::endl;
		}

		curl_easy_cleanup(curl);
	}

	finished = true;
}

static void
getter_thread(const std::string &submit_url,
              const std::string &query,
              bool &finished,
              const SubmitterConfig &cfg)
{

	if (!std::filesystem::is_directory(cfg.VBS_submit_archive_dir))
		std::filesystem::create_directory(cfg.VBS_submit_archive_dir);

	if (!std::filesystem::is_directory(cfg.VBS_submit_archive_dir))
		warn("wtf, directory was not created");

	{
		std::string path = cfg.VBS_submit_archive_dir +
		                   std::string("/") +
		                   std::to_string(timestamp()) +
		                   cfg.VBS_submit_archive_log_suffix;
		std::ofstream o(path.c_str(), std::ios::app);
		if (!o) {
			warn("Could not write a log file!");
		} else {
			o << "{"
			  << "\"query_string\": \"" << query << "\","
			  << std::endl
			  << "\"submit_url\": \"" << submit_url << "\""
			  << std::endl;

			o << "}" << std::endl;
		}
	}

	if (cfg.extra_verbose_log) {
		std::cout << "**********************" << std::endl
		          << "GET '" << submit_url << "' request: " << query
		          << std::endl;
	}

	if (cfg.submit_to_VBS) {
		CURL *curl = curl_easy_init();
		std::string res_buffer;

#ifdef DEBUG_CURL_REQUESTS

		curl_easy_setopt(curl, CURLOPT_DEBUGFUNCTION, trace_fn);
		curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L);

#endif // DEBUG_CURL_REQUESTS

		curl_easy_setopt(curl, CURLOPT_HEADER, 0);
		curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1);
		curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 30);

		std::string url = submit_url;
		url += "?" + query;

		curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
		curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "GET");

		static std::string hdr = "Content-type: application/json";
		static struct curl_slist reqheader = { hdr.data(), nullptr };
		curl_easy_setopt(curl, CURLOPT_HTTPHEADER, &reqheader);

		curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, res_cb);
		curl_easy_setopt(curl, CURLOPT_WRITEDATA, &res_buffer);

		// If DRES server
		if (std::holds_alternative<ServerConfigDres>(cfg.server_cfg)) {
			auto s_cfg{ std::get<ServerConfigDres>(
			  cfg.server_cfg) };

			curl_easy_setopt(
			  curl, CURLOPT_COOKIEFILE, s_cfg.cookie_file.c_str());
			curl_easy_setopt(
			  curl, CURLOPT_COOKIEJAR, s_cfg.cookie_file.c_str());
		}

		auto res = curl_easy_perform(curl);

		if (res == CURLE_OK) {
			info("GET request OK: " << url);
		} else {
			warn("GET request failed with cURL error: "
			     << curl_easy_strerror(res));
		}

		if (cfg.extra_verbose_log) {
			std::cout << std::endl
			          << "RESPONSE:" << std::endl
			          << res_buffer << std::endl
			          << "**********************" << std::endl;
		}

		curl_easy_cleanup(curl);
	}

	finished = true;
}

bool
Submitter::login_to_DRES() const
{
	auto s_cfg{ std::get<ServerConfigDres>(cfg.server_cfg) };

	CURL *curl;
	CURLcode res;
	curl = curl_easy_init();
	std::string res_buffer;

	if (curl) {

#ifdef DEBUG_CURL_REQUESTS

		curl_easy_setopt(curl, CURLOPT_DEBUGFUNCTION, trace_fn);
		curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L);

#endif // DEBUG_CURL_REQUESTS

		curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "POST");
		curl_easy_setopt(curl, CURLOPT_URL, s_cfg.login_URL.c_str());
		curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);

		struct curl_slist *headers = NULL;
		headers =
		  curl_slist_append(headers, "Content-Type: application/json");
		curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

		const std::string data_str{ "{ \"username\": \""s +
			                    s_cfg.username +
			                    "\" ,\"password\": \""s +
			                    s_cfg.password + "\" }" };

		const char *data = data_str.c_str();
		curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data);

		curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, res_cb);
		curl_easy_setopt(curl, CURLOPT_WRITEDATA, &res_buffer);

		curl_easy_setopt(
		  curl, CURLOPT_COOKIEFILE, s_cfg.cookie_file.c_str());
		curl_easy_setopt(
		  curl, CURLOPT_COOKIEJAR, s_cfg.cookie_file.c_str());

		res = curl_easy_perform(curl);

		long http_code{ 0 };
		curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);

		if (cfg.extra_verbose_log) {
			std::cout << std::endl
			          << "RESPONSE:" << std::endl
			          << res_buffer << std::endl
			          << "**********************" << std::endl;
		}

		curl_easy_cleanup(curl);

		if (res != CURLE_OK) {
			warn("DRES server login request returned cURL error: "
			     << curl_easy_strerror(res));
			return false;
		} else {
			info(
			  "DRES server login request returned: " << http_code);
		}

		// Parse the response
		std::string err;
		auto res_json{ json11::Json::parse(res_buffer, err) };
		if (!err.empty()) {
			std::string msg{ "Error parsing JSON response: " +
				         res_buffer };
			warn(msg);
			throw std::runtime_error(msg);
		}

		bool login_status{ res_json["status"].bool_value() };
		std::string login_status_desc{
			res_json["description"].string_value()
		};

		// If login failed
		if (!login_status) {
			warn("DRES server login failed! Message: "
			     << login_status_desc);
			return false;
		}
		info("DRES server login OK... Message: " << login_status_desc);
		return true;
	}
	return false;
}

Submitter::Submitter(const SubmitterConfig &config)
  : last_submit_timestamp(timestamp())
  , cfg(config){

#ifdef LOG_LOGS
	  { // Make sure the directory exists
	    if (!(std::filesystem::exists(LOG_LOGS_DIR))){
	      std::filesystem::create_directories(LOG_LOGS_DIR);
}

std::string filepath{ LOG_LOGS_DIR + "actions_" +
	              get_formated_timestamp("%d-%m-%Y_%H-%M-%S") + ".log" };

act_log.open(filepath, std::ios::out);
if (!act_log.is_open()) {
	std::string msg{ "Error openning file: " + filepath };
	warn(msg);

#ifndef NDEBUG
	throw std::runtime_error(msg);
#endif // NDEBUG
}

// Enable automatic flushing
act_log << std::unitbuf;
}

#endif // LOG_LOGS

#ifdef LOG_CURL_REQUESTS
{
	// Make sure the directory exists
	if (!(std::filesystem::exists(LOG_CURL_REQUESTS_DIR))) {
		std::filesystem::create_directories(LOG_CURL_REQUESTS_DIR);
	}

	std::string filepath{ LOG_CURL_REQUESTS_DIR + "requests_" +
		              get_formated_timestamp("%d-%m-%Y_%H-%M-%S") +
		              ".log" };

	req_log.open(filepath, std::ios::out);
	if (!req_log.is_open()) {
		std::string msg{ "Error openning file: " + filepath };
		warn(msg);

#ifndef NDEBUG
		throw std::runtime_error(msg);
#endif // NDEBUG
	}

	// Enable automatic flushing
	req_log << std::unitbuf;
}

#endif // LOG_CURL_REQUESTS
}

Submitter::~Submitter()
{
	send_backlog_only();

	for (auto &t : submit_threads)
		t.join();
}

void
Submitter::submit_and_log_submit(const DatasetFrames &frames,
                                 DisplayType disp_type,
                                 ImageId frame_ID)
{
	log_submit(frames, disp_type, frame_ID);

	auto vf = frames.get_frame(frame_ID);

	std::stringstream query_ss;

	if (is_DRES_server()) {
		query_ss << "item=" << std::setfill('0') << std::setw(5)
		         << (vf.video_ID + 1) //< !! VBS videos start from 1
		         << "&frame="
		         << vf.frame_number; //< !! VBS frame numbers start at 0
	} else {
		query_ss << "team=" << cfg.team_ID
		         << "&member=" << cfg.member_ID << "&video="
		         << (vf.video_ID + 1) //< !! VBS videos start from 1
		         << "&frame="
		         << vf.frame_number; //< !! VBS frame numbers start at 0
	}

	send_query_with_backlog(query_ss.str());
}

void
Submitter::log_submit(const DatasetFrames & /*frames*/,
                      DisplayType disp_type,
                      ImageId frame_ID)
{
#ifdef LOG_LOGS

	alog() << "submit_frame\t"
	       << "\t"
	       << "frame_ID=" << frame_ID << "\t"
	       << "disp_type=" << disp_type_to_str(disp_type) << std::endl;

#endif // LOG_LOGS
}

void
Submitter::log_rerank(const DatasetFrames & /*frames*/,
                      DisplayType /*from_disp_type*/,
                      const std::vector<ImageId> & /*topn_imgs*/)
{
	// @todo we can log them for our purporses
}

void
Submitter::send_backlog_only()
{
	// Send interaction logs
	if (!backlog.empty()) {
		Json a = Json::object{ { "timestamp", double(timestamp()) },
			               { "events", std::move(backlog) },
			               { "type", "interaction" },
			               { "teamId", int(cfg.team_ID) },
			               { "memberId", int(cfg.member_ID) } };
		backlog.clear();
		start_poster(get_interaction_URL(), ""s, a.dump());
	}

	// We always reset timer
	last_submit_timestamp = timestamp();
}

void
Submitter::submit_and_log_rescore(const DatasetFrames &frames,
                                  const ScoreModel &scores,
                                  const std::set<ImageId> &likes,
                                  const UsedTools &used_tools,
                                  DisplayType /*disp_type*/,
                                  const std::vector<ImageId> &topn_imgs,
                                  const std::string &sentence_query,
                                  const size_t topn_frames_per_video,
                                  const size_t topn_frames_per_shot)
{

	std::vector<Json> results;
	results.reserve(topn_imgs.size());

	{
		size_t i{ 0 };
		for (auto &&img_ID : topn_imgs) {
			auto vf = frames.get_frame(img_ID);
			results.push_back(Json::object{
			  { "video", std::to_string(vf.video_ID + 1) },
			  { "frame", int(vf.frame_number) },
			  { "score", double(scores[img_ID]) },
			  { "rank", int(i) } });
			++i;
		}
	}

	std::vector<Json> used_cats;
	std::vector<Json> used_types;
	std::vector<Json> sort_types;

	std::string query_val(sentence_query + ";");

	// If Top KNN request
	if (used_tools.topknn_used) {

		// Mark this as KNN request
		query_val += "show_knn;";

		used_cats.push_back("image");
		used_types.push_back("globalFeatures");
		sort_types.push_back("globalFeatures");
	}
	// Else normal rescore
	else {

		// Just mark that this was NOT KNN request
		query_val += "normal_rescore;";

		if (used_tools.KWs_used) {
			used_cats.push_back("text");
			used_types.push_back("jointEmbedding");
			sort_types.push_back("jointEmbedding");
		}

		if (used_tools.bayes_used) {
			used_cats.push_back("image");
			used_types.push_back("feedbackModel");
			sort_types.push_back("feedbackModel");
		}
	}

	query_val += "from_video_limit=";
	query_val += std::to_string(topn_frames_per_video);
	query_val += ";from_shot_limit=";
	query_val += std::to_string(topn_frames_per_shot);

	Json result_json_arr = Json::array(results);

	std::vector<Json> values{ query_val };
	Json values_arr = Json::array(values);

	Json top = Json::object{ { "teamId", int(cfg.team_ID) },
		                 { "memberId", int(cfg.member_ID) },
		                 { "timestamp", double(timestamp()) },
		                 { "usedCategories", used_cats },
		                 { "usedTypes", used_types },
		                 { "sortType", sort_types },
		                 { "resultSetAvailability", "top" },
		                 { "type", "result" },
		                 { "values", values_arr },
		                 { "results", std::move(result_json_arr) } };

	start_poster(get_rerank_URL(), "", top.dump());

#ifdef LOG_LOGS

	// KNN is not rescore, so we ignore it
	if (!used_tools.topknn_used) {

		auto &ss{ alog() };

		ss << "rescore\t"
		   << "text_query=\"" << sentence_query << "\"\t"
		   << "likes=[";

		{
			size_t ii{ 0 };
			for (auto &&l : likes) {
				if (ii > 0)
					ss << ",";

				ss << l;
				++ii;
			}
		}

		ss << "]\t" << std::endl;
	}

#endif // LOG_LOGS
}

void
Submitter::log_text_query_change(const std::string &text_query)
{
	static int64_t last_logged{ 0 };

	// If timeout should be handled here
	if (cfg.apply_log_action_timeout) {
		// If no need to log now
		if (last_logged + cfg.log_action_timeout > size_t(timestamp()))
			return;
	}

#ifdef LOG_LOGS

	alog() << "text_query\t"
	       << "text_query=" << text_query << std::endl;

#endif // LOG_LOGS

	push_event("text", "jointEmbedding", text_query);
}
void
Submitter::log_like(const DatasetFrames &frames,
                    DisplayType /*disp_type*/,
                    ImageId frame_ID)
{
	auto vf = frames.get_frame(frame_ID);

#ifdef LOG_LOGS

	alog() << "like\t"
	       << "frame_ID=" << frame_ID << "\t"
	       << "liked=" << vf.liked << "\t" << std::endl;

#endif // LOG_LOGS

	std::stringstream data_ss;
	data_ss << "VId" << (vf.video_ID + 1) << ",FN" << vf.frame_number
	        << ";FId" << frame_ID << ";like;";

	push_event("image", "feedbackModel", data_ss.str());
}

void
Submitter::log_unlike(const DatasetFrames &frames,
                      DisplayType /*disp_type*/,
                      ImageId frame_ID)
{
	auto vf = frames.get_frame(frame_ID);

#ifdef LOG_LOGS

	alog() << "unlike\t"
	       << "frame_ID=" << frame_ID << "\t"
	       << "liked=" << vf.liked << "\t" << std::endl;

#endif // LOG_LOGS

	std::stringstream data_ss;
	data_ss << "VId" << (vf.video_ID + 1) << ",FN" << vf.frame_number
	        << ";FId" << frame_ID << ";unlike;";

	push_event("image", "feedbackModel", data_ss.str());
}

void
Submitter::log_show_random_display(const DatasetFrames & /*frames*/,
                                   const std::vector<ImageId> & /*imgs*/)
{
	push_event("browsing", "randomSelection", "random_display;");

#ifdef LOG_LOGS

	alog() << "show_random_display\t" << std::endl;

#endif // LOG_LOGS
}

void
Submitter::log_show_som_display(const DatasetFrames & /*frames*/,
                                const std::vector<ImageId> & /*imgs*/)
{
	push_event("browsing", "exploration", "som_display");

#ifdef LOG_LOGS

	alog() << "show_SOM_display\t" << std::endl;

#endif // LOG_LOGS
}

void
Submitter::log_show_topn_display(const DatasetFrames & /*frames*/,
                                 const std::vector<ImageId> & /*imgs*/)
{
	push_event("browsing", "rankedList", "topn_display");

#ifdef LOG_LOGS

	alog() << "show_topN_display\t" << std::endl;

#endif // LOG_LOGS
}

void
Submitter::log_show_topn_context_display(const DatasetFrames & /*frames*/,
                                         const std::vector<ImageId> & /*imgs*/)
{
	push_event("browsing", "rankedList", "topn_context_display;");

#ifdef LOG_LOGS

	alog() << "show_topN_context_display\t" << std::endl;

#endif // LOG_LOGS
}

void
Submitter::log_show_topknn_display(const DatasetFrames &frames,
                                   ImageId frame_ID,
                                   const std::vector<ImageId> & /*imgs*/)
{
	auto vf = frames.get_frame(frame_ID);

	std::stringstream data_ss;
	data_ss << "VId" << (vf.video_ID + 1) << ",FN" << vf.frame_number
	        << ";FId" << frame_ID << ";topknn_display;";

	push_event("image", "globalFeatures", data_ss.str());

#ifdef LOG_LOGS

	alog() << "show_topKNN_display\t"
	       << "frame_ID=" << frame_ID << std::endl;

#endif // LOG_LOGS
}

void
Submitter::log_show_detail_display(const DatasetFrames &frames,
                                   ImageId frame_ID)
{
	auto vf = frames.get_frame(frame_ID);

	std::stringstream data_ss;
	data_ss << "VId" << (vf.video_ID + 1) << ",FN" << vf.frame_number
	        << ";FId" << frame_ID << ";video_detail;";

	push_event("browsing", "videoSummary", data_ss.str());

#ifdef LOG_LOGS

	alog() << "show_detail_display\t"
	       << "frame_ID=" << frame_ID << std::endl;

#endif // LOG_LOGS
}

void
Submitter::log_show_video_replay(const DatasetFrames &frames,
                                 ImageId frame_ID,
                                 float delta)
{
	static int64_t last_replay_submit = 0;
	static ImageId last_frame_ID = IMAGE_ID_ERR_VAL;

	// If timeout should be handled here
	if (cfg.apply_log_action_timeout) {
		// If no need to log now
		if (last_replay_submit + cfg.log_action_timeout >
		      size_t(timestamp()) &&
		    frame_ID == last_frame_ID)
			return;
	}

	last_replay_submit = timestamp();
	last_frame_ID = frame_ID;

	auto vf = frames.get_frame(frame_ID);

	std::stringstream data_ss;
	data_ss << "VId" << (vf.video_ID + 1) << ",FN" << vf.frame_number
	        << ";FId" << frame_ID << ";replay;";

	push_event("browsing", "temporalContext", data_ss.str());

#ifdef LOG_LOGS

	alog() << "replay_video\t"
	       << "frame_ID=" << frame_ID << "\t"
	       << "video_ID=" << vf.video_ID << "\t"
	       << "dir=" << (delta > 0.0F ? "forward" : "backwards")
	       << std::endl;

#endif // LOG_LOGS
}

void
Submitter::log_scroll(const DatasetFrames & /*frames*/,
                      DisplayType from_disp_type,
                      float dirY)
{
	std::string ev_type("rankedList");
	std::string disp_type;

	switch (from_disp_type) {
		case DisplayType::DTopN:
			ev_type = "rankedList";
			disp_type = "topn_display";
			break;

		case DisplayType::DTopNContext:
			ev_type = "rankedList";
			disp_type = "topn_display_with_context";
			break;

		case DisplayType::DTopKNN:
			ev_type = "rankedList";
			disp_type = "topknn_display";
			break;

		case DisplayType::DVideoDetail:
			ev_type = "videoSummary";
			disp_type = "video_detail";
			break;

		default:
			return;
			break;
	}

	static int64_t last_logged = 0;
	static DisplayType last_disp_type = DisplayType::DNull;

	// If timeout should be handled here
	if (cfg.apply_log_action_timeout) {
		// If no need to log now
		if (last_logged + cfg.log_action_timeout >
		      size_t(timestamp()) &&
		    from_disp_type == last_disp_type)
			return;
	}

	last_logged = timestamp();
	last_disp_type = from_disp_type;

	std::stringstream data_ss;
	data_ss << "scroll" << (dirY > 0 ? "Up" : "Down") << ";" << dirY << ";"
	        << disp_type << ";";

	push_event("browsing", ev_type, data_ss.str());

#ifdef LOG_LOGS

	alog() << "mouse_scroll\t"
	       << "dir=" << (dirY > 0 ? "up" : "down") << "\t"
	       << "disp_type=" << disp_type << std::endl;

#endif // LOG_LOGS
}

void
Submitter::log_reset_search()
{
	push_event("browsing", "resetAll", "");

#ifdef LOG_LOGS

	alog() << "reset_all\t" << std::endl;

#endif // LOG_LOGS
}

void
Submitter::start_poster(const std::string &submit_url,
                        const std::string &query_string,
                        const std::string &post_data)
{
	finish_flags.emplace_back(std::make_unique<bool>(false));
	submit_threads.emplace_back(poster_thread,
	                            submit_url,
	                            query_string,
	                            post_data,
	                            std::ref(*(finish_flags.back())),
	                            cfg);
}

void
Submitter::start_getter(const std::string &submit_url,
                        const std::string &query_string)
{
	finish_flags.emplace_back(std::make_unique<bool>(false));
	submit_threads.emplace_back(getter_thread,
	                            submit_url,
	                            query_string,
	                            std::ref(*(finish_flags.back())),
	                            cfg);
}

void
Submitter::poll()
{
	if (last_submit_timestamp + cfg.send_logs_to_server_period <
	    size_t(timestamp()))
		send_backlog_only();

	for (size_t i = 0; i < submit_threads.size();)
		if (*finish_flags[i]) {
			submit_threads[i].join();
			submit_threads.erase(submit_threads.begin() + i);
			finish_flags.erase(finish_flags.begin() + i);
		} else
			++i;
}

void
Submitter::send_query_with_backlog(const std::string &query_string)
{
	// Send the submit
	start_getter(get_submit_URL(), query_string);

	// Send the backlog
	send_backlog_only();
}

void
Submitter::push_event(const std::string &cat,
                      const std::string &type,
                      const std::string &value)
{

	std::vector<Json> types{ type };
	Json types_arr = Json::array(types);

	Json a = Json::object{ { "timestamp", double(timestamp()) },
		               { "category", cat },
		               { "type", types_arr },
		               { "value", value } };

	backlog.emplace_back(std::move(a));
}

bool
Submitter::is_DRES_server() const
{
	return std::holds_alternative<ServerConfigDres>(cfg.server_cfg);
}

const std::string &
Submitter::get_submit_URL() const
{
	if (std::holds_alternative<ServerConfigDres>(cfg.server_cfg)) {
		return std::get<ServerConfigDres>(cfg.server_cfg).submit_URL;
	}

	return std::get<ServerConfigVbs>(cfg.server_cfg).submit_URL;
}

const std::string &
Submitter::get_rerank_URL() const
{
	if (std::holds_alternative<ServerConfigDres>(cfg.server_cfg)) {
		return std::get<ServerConfigDres>(cfg.server_cfg)
		  .submit_rerank_URL;
	}

	return std::get<ServerConfigVbs>(cfg.server_cfg).submit_rerank_URL;
}

const std::string &
Submitter::get_interaction_URL() const
{
	if (std::holds_alternative<ServerConfigDres>(cfg.server_cfg)) {
		return std::get<ServerConfigDres>(cfg.server_cfg)
		  .submit_interaction_URL;
	}

	return std::get<ServerConfigVbs>(cfg.server_cfg).submit_interaction_URL;
}
