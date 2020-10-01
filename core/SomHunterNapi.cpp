
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

#include <optional>
#include <stdexcept>

#include "SomHunterNapi.h"

#include "common.h"

Napi::FunctionReference SomHunterNapi::constructor;

Napi::Object
SomHunterNapi::Init(Napi::Env env, Napi::Object exports)
{
	Napi::HandleScope scope(env);

	Napi::Function func = DefineClass(
	  env,
	  "SomHunterNapi",
	  { InstanceMethod("getDisplay", &SomHunterNapi::get_display),
	    InstanceMethod("likeFrames", &SomHunterNapi::like_frames),
	    InstanceMethod("rescore", &SomHunterNapi::rescore),
	    InstanceMethod("logVideoReplay", &SomHunterNapi::log_video_replay),
	    InstanceMethod("logScroll", &SomHunterNapi::log_scroll),
	    InstanceMethod("logTextQueryChange",
	                   &SomHunterNapi::log_text_query_change),
	    InstanceMethod("resetAll", &SomHunterNapi::reset_all),
	    InstanceMethod("autocompleteKeywords",
	                   &SomHunterNapi::autocomplete_keywords),
	    InstanceMethod("isSomReady", &SomHunterNapi::is_som_ready),
	    InstanceMethod("loginToDres", &SomHunterNapi::login_to_dres),
	    InstanceMethod("submitToServer", &SomHunterNapi::submit_to_server),
	    InstanceMethod("getSearchContext",
	                   &SomHunterNapi::get_search_context),
	    InstanceMethod("getUserContext", &SomHunterNapi::get_user_context),
	    InstanceMethod("switchSearchContext",
	                   &SomHunterNapi::switch_search_context) });
	constructor = Napi::Persistent(func);
	constructor.SuppressDestruct();

	exports.Set("SomHunterNapi", func);

	return exports;
}

SomHunterNapi::SomHunterNapi(const Napi::CallbackInfo &info)
  : Napi::ObjectWrap<SomHunterNapi>(info)
{
	debug("API: Instantiating SomHunter...");

	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int length = info.Length();
	if (length != 1) {
		Napi::TypeError::New(env, "Wrong number of parameters")
		  .ThrowAsJavaScriptException();
	}

	std::string config_fpth = info[0].As<Napi::String>().Utf8Value();

	// Parse the config
	Config cfg = Config::parse_json_config(config_fpth);
	try {
		somhunter = new SomHunter(cfg);
		debug("API: SomHunter initialized.");
	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}
}

Napi::Value
VideoFrame_to_res(Napi::Env &env,
                  const VideoFrame *p_frame,
                  const LikesCont &likes,
                  const BookmarksCont &bookmarks,
                  const std::string &path_prefix)
{
	napi_value obj;
	napi_create_object(env, &obj);
	{
		ImageId ID{ IMAGE_ID_ERR_VAL };
		ImageId v_ID{ IMAGE_ID_ERR_VAL };
		ImageId s_ID{ IMAGE_ID_ERR_VAL };

		Hour hour{ ERR_VAL<Hour>() };
		Weekday weekday{ ERR_VAL<Weekday>() };

		bool is_liked{ false };
		bool is_bookmarked{ false };
		std::string filename{};

		if (p_frame != nullptr) {
			ID = p_frame->frame_ID;
			v_ID = p_frame->video_ID;
			s_ID = p_frame->shot_ID;

			hour = p_frame->hour;
			weekday = p_frame->weekday;

			is_liked = (likes.count(ID) > 0 ? true : false);
			filename = path_prefix + p_frame->filename;

			is_bookmarked =
			  (bookmarks.count(ID) > 0 ? true : false);
		}

		{
			napi_value key;
			napi_create_string_utf8(
			  env, "id", NAPI_AUTO_LENGTH, &key);

			napi_value value;
			if (ID == IMAGE_ID_ERR_VAL) {
				napi_get_null(env, &value);
			} else {
				napi_create_uint32(env, uint32_t(ID), &value);
			}

			napi_set_property(env, obj, key, value);
		}

		{
			napi_value key;
			napi_create_string_utf8(
			  env, "vId", NAPI_AUTO_LENGTH, &key);

			napi_value value;
			if (ID == IMAGE_ID_ERR_VAL) {
				napi_get_null(env, &value);
			} else {
				napi_create_uint32(env, uint32_t(v_ID), &value);
			}

			napi_set_property(env, obj, key, value);
		}

		{
			napi_value key;
			napi_create_string_utf8(
			  env, "sId", NAPI_AUTO_LENGTH, &key);

			napi_value value;
			if (ID == IMAGE_ID_ERR_VAL) {
				napi_get_null(env, &value);
			} else {
				napi_create_uint32(env, uint32_t(s_ID), &value);
			}

			napi_set_property(env, obj, key, value);
		}

		{ // *** hour ***
			napi_value key;
			napi_create_string_utf8(
			  env, "hour", NAPI_AUTO_LENGTH, &key);

			napi_value value;
			if (hour == ERR_VAL<Hour>()) {
				napi_get_null(env, &value);
			} else {
				napi_create_uint32(env, uint32_t(hour), &value);
			}

			napi_set_property(env, obj, key, value);
		}

		{ // *** weekday ***
			napi_value key;
			napi_create_string_utf8(
			  env, "weekday", NAPI_AUTO_LENGTH, &key);

			napi_value value;
			if (weekday == ERR_VAL<Hour>()) {
				napi_get_null(env, &value);
			} else {
				napi_create_uint32(
				  env, uint32_t(weekday), &value);
			}

			napi_set_property(env, obj, key, value);
		}

		{
			napi_value key;
			napi_create_string_utf8(
			  env, "liked", NAPI_AUTO_LENGTH, &key);

			napi_value value;
			napi_get_boolean(env, is_liked, &value);

			napi_set_property(env, obj, key, value);
		}

		{ // *** bookmarked ***
			napi_value key;
			napi_create_string_utf8(
			  env, "bookmarked", NAPI_AUTO_LENGTH, &key);

			napi_value value;
			napi_get_boolean(env, is_bookmarked, &value);

			napi_set_property(env, obj, key, value);
		}

		{
			napi_value key;
			napi_create_string_utf8(
			  env, "src", NAPI_AUTO_LENGTH, &key);

			napi_value value;
			napi_create_string_utf8(
			  env, filename.c_str(), NAPI_AUTO_LENGTH, &value);

			napi_set_property(env, obj, key, value);
		}
	}

	return Napi::Object(env, obj);
}

Napi::Value
construct_result_from_GetDisplayResult(Napi::Env &env,
                                       const GetDisplayResult &res,
                                       size_t page_num,
                                       const std::string &path_prefix)
{
	const auto &frames{ res.frames };
	const auto &likes{ res.likes };
	const auto &bookmarks{ res.bookmarks };

	napi_value result;
	napi_create_object(env, &result);

	{ // *** page ***
		napi_value key;
		napi_create_string_utf8(env, "page", NAPI_AUTO_LENGTH, &key);

		napi_value value;
		napi_create_uint32(env, uint32_t(page_num), &value);

		napi_set_property(env, result, key, value);
	}

	{ // *** frames ***
		napi_value key;
		napi_create_string_utf8(env, "frames", NAPI_AUTO_LENGTH, &key);

		// Create array
		napi_value arr;
		napi_create_array(env, &arr);

		size_t i{ 0_z };
		for (auto it{ frames.begin() }; it != frames.end(); ++it) {

			auto fr{ VideoFrame_to_res(
			  env, *it, likes, bookmarks, path_prefix) };
			napi_set_element(env, arr, i, fr);

			++i;
		}

		napi_set_property(env, result, key, arr);
	}

	return Napi::Object(env, result);
}

Napi::Value
SomHunterNapi::get_display(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int length = info.Length();
	if (length > 5) {
		Napi::TypeError::New(env,
		                     "Wrong number of parameters "
		                     "(SomHunterNapi::get_display)")
		  .ThrowAsJavaScriptException();
	}

	ImageId selected_image{ IMAGE_ID_ERR_VAL };
	size_t page_num{ 0 };

	std::string path_prefix{ info[0].As<Napi::String>().Utf8Value() };
	// Get the display type
	std::string display_string{ info[1].As<Napi::String>().Utf8Value() };

	DisplayType disp_type = str_to_disp_type(display_string);

	if (disp_type == DisplayType::DTopN) {
		page_num = info[2].As<Napi::Number>().Uint32Value();

	} else if (disp_type == DisplayType::DTopNContext) {
		page_num = info[2].As<Napi::Number>().Uint32Value();

	} else if (disp_type == DisplayType::DSom) {

	} else if (disp_type == DisplayType::DVideoDetail) {
		selected_image = info[3].As<Napi::Number>().Uint32Value();

	} else if (disp_type == DisplayType::DTopKNN) {
		selected_image = info[3].As<Napi::Number>().Uint32Value();
		page_num = info[2].As<Napi::Number>().Uint32Value();
	}

	bool log_it{ true };
	if (length >= 5) {
		log_it = info[4].As<Napi::Boolean>().Value();
	}

	try {

		// << Core >>
		auto display_frames = somhunter->get_display(
		  disp_type, selected_image, page_num, log_it);
		// << Core >>

		return construct_result_from_GetDisplayResult(
		  env, display_frames, page_num, path_prefix);

	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}
	return Napi::Object(env, {});
}

Napi::Value
SomHunterNapi::like_frames(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int length = info.Length();

	if (length != 1) {
		Napi::TypeError::New(env, "Wrong number of parameters")
		  .ThrowAsJavaScriptException();
	}

	std::vector<ImageId> fr_IDs;

	Napi::Array arr = info[0].As<Napi::Array>();
	for (size_t i{ 0 }; i < arr.Length(); ++i) {
		Napi::Value val = arr[i];

		size_t fr_ID{ val.As<Napi::Number>().Uint32Value() };
		fr_IDs.emplace_back(fr_ID);
	}

	std::vector<bool> like_flags;
	try {
		debug("API: CALL \n\t like_frames\n\t\fr_IDs.size() = "
		      << fr_IDs.size() << std::endl);

		like_flags = somhunter->like_frames(fr_IDs);
	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}

	// Return structure
	napi_value result_arr;
	napi_create_array(env, &result_arr);

	size_t i{ 0 };
	for (auto &&flag : like_flags) {
		napi_value res;
		napi_get_boolean(env, flag, &res);

		napi_set_element(env, result_arr, i, res);
	}

	return Napi::Object(env, result_arr);
	;
}

Napi::Value
construct_result_from_SearchHistory(Napi::Env &env,
                                    const std::vector<SearchContext> &history)
{
	// Return structure
	napi_value result_arr;
	napi_create_array(env, &result_arr);

	size_t i{ 0 };
	for (auto &&ctx : history) {

		napi_value hist_point;
		napi_create_object(env, &hist_point);

		{ // *** ID ***
			napi_value key;
			napi_create_string_utf8(
			  env, "id", NAPI_AUTO_LENGTH, &key);
			napi_value value;
			napi_create_uint32(env, ctx.ID, &value);

			napi_set_property(env, hist_point, key, value);
		}

		{ // *** screenshotFilepath ***
			napi_value key;
			napi_create_string_utf8(
			  env, "screenshotFilepath", NAPI_AUTO_LENGTH, &key);
			napi_value value;
			napi_create_string_utf8(env,
			                        ctx.screenshot_fpth.c_str(),
			                        NAPI_AUTO_LENGTH,
			                        &value);

			napi_set_property(env, hist_point, key, value);
		}

		{ // *** time ***
			napi_value key;
			napi_create_string_utf8(
			  env, "time", NAPI_AUTO_LENGTH, &key);
			napi_value value;
			napi_create_string_utf8(
			  env, ctx.label.c_str(), NAPI_AUTO_LENGTH, &value);

			napi_set_property(env, hist_point, key, value);
		}

		napi_set_element(env, result_arr, i, hist_point);

		++i;
	}

	return Napi::Object(env, result_arr);
}

Napi::Value
construct_result_from_RescoreResult(Napi::Env &env,
                                    const RescoreResult &rescore_res)
{
	size_t curr_ctx_ID{ rescore_res.curr_ctx_ID };
	const auto &history{ rescore_res.history };

	// Return structure

	napi_value result_obj;
	napi_create_object(env, &result_obj);

	{ /* *** currId *** */
		napi_value key;
		napi_create_string_utf8(env, "currId", NAPI_AUTO_LENGTH, &key);

		napi_value value;
		napi_create_uint32(env, curr_ctx_ID, &value);

		napi_set_property(env, result_obj, key, value);
	}

	{ /* *** history *** */
		napi_value key;
		napi_create_string_utf8(env, "history", NAPI_AUTO_LENGTH, &key);

		auto result_arr{ construct_result_from_SearchHistory(env,
			                                             history) };
		napi_set_property(env, result_obj, key, result_arr);
	}

	return Napi::Object(env, result_obj);
}

Napi::Value
SomHunterNapi::rescore(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int length = info.Length();
	if (length != 6) {
		Napi::TypeError::New(env, "Wrong number of arguments!")
		  .ThrowAsJavaScriptException();
	}

	// Convert arguments
	std::string user_token{ info[0].As<Napi::String>().Utf8Value() };
	std::string query{ info[1].As<Napi::String>().Utf8Value() };

	// Convert filters argument
	Napi::Object o{ info[2].As<Napi::Object>() };
	Hour from{ Hour(o.Get("hourFrom").As<Napi::Number>().Uint32Value()) };
	Hour to{ Hour(o.Get("hourTo").As<Napi::Number>().Uint32Value()) };
	uint8_t weekdays_mask{ uint8_t(
	  o.Get("weekdaysMask").As<Napi::Number>().Uint32Value()) };

	size_t src_search_ctx_ID{ info[3].As<Napi::Number>().Uint32Value() };
	std::string screenshot{ info[4].As<Napi::String>().Utf8Value() };
	std::string time_string{ info[5].As<Napi::String>().Utf8Value() };

	Filters filters{ TimeFilter{ from, to },
		         WeekDaysFilter{ weekdays_mask } };

	std::cout << "Calling `rescore` with filters: "
	          << "\n\t from=" << size_t(from) << "\n\t to=" << size_t(to)
	          << "\n\t weekdays_mask=" << size_t(weekdays_mask)
	          << std::endl;

	try {
		// << Core >>
		auto rescore_res{ somhunter->rescore(query,
			                             &filters,
			                             src_search_ctx_ID,
			                             screenshot,
			                             time_string) };
		// << Core >>

		return construct_result_from_RescoreResult(env, rescore_res);

	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}

	return Napi::Object{};
}

Napi::Value
SomHunterNapi::reset_all(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int length = info.Length();
	if (length != 0) {
		Napi::TypeError::New(env,
		                     "Wrong number of parameters "
		                     "(SomHunterNapi::reset_all)")
		  .ThrowAsJavaScriptException();
	}
	try {
		debug("API: CALL \n\t reset_all()");

		somhunter->reset_search_session();

	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}

	return Napi::Object{};
}

Napi::Value
SomHunterNapi::log_video_replay(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int length = info.Length();

	if (length != 2) {
		Napi::TypeError::New(env, "Wrong number of parameters")
		  .ThrowAsJavaScriptException();
	}

	ImageId fr_ID{ info[0].As<Napi::Number>().Uint32Value() };
	float delta{ float(info[1].As<Napi::Number>().DoubleValue()) };

	try {
		debug("API: CALL \n\t log_video_replay\n\t frame_ID = "
		      << fr_ID << std::endl);

		somhunter->log_video_replay(fr_ID, delta);
	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}

	return Napi::Object{};
}

Napi::Value
SomHunterNapi::log_scroll(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int length = info.Length();

	if (length != 2) {
		Napi::TypeError::New(env, "Wrong number of parameters")
		  .ThrowAsJavaScriptException();
	}

	std::string disp_type{ info[0].As<Napi::String>().Utf8Value() };
	float delta_Y{ float(info[1].As<Napi::Number>().DoubleValue()) };

	DisplayType dt{ str_to_disp_type(disp_type) };

	try {
		debug("API: CALL \n\t log_scroll\n\t disp_type="
		      << disp_type << "\n\tdeltaY=" << delta_Y << std::endl);

		somhunter->log_scroll(dt, delta_Y);
	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}

	return Napi::Object{};
}

Napi::Value
SomHunterNapi::log_text_query_change(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int length = info.Length();

	if (length != 1) {
		Napi::TypeError::New(env, "Wrong number of parameters")
		  .ThrowAsJavaScriptException();
	}

	std::string query{ info[0].As<Napi::String>().Utf8Value() };

	try {
		debug("API: CALL \n\t log_text_query_change\n\t query="
		      << query << std::endl);

		somhunter->log_text_query_change(query);
	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}

	return Napi::Object{};
}

Napi::Value
SomHunterNapi::autocomplete_keywords(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int length = info.Length();

	if (length != 4) {
		Napi::TypeError::New(env, "Wrong number of parameters")
		  .ThrowAsJavaScriptException();
	}

	std::string path_prefix{ info[0].As<Napi::String>().Utf8Value() };
	std::string prefix{ info[1].As<Napi::String>().Utf8Value() };
	size_t count{ info[2].As<Napi::Number>().Uint32Value() };
	size_t example_count{ info[3].As<Napi::Number>().Uint32Value() };

	// Get suggested keywords
	std::vector<const Keyword *> kws;
	try {
		kws = somhunter->autocomplete_keywords(prefix, count);
	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}

	// Return structure
	napi_value result_arr;
	napi_create_array(env, &result_arr);

	size_t i = 0ULL;
	// Iterate through all results
	for (auto &&p_kw : kws) {

		napi_value single_result_dict;
		napi_create_object(env, &single_result_dict);

		// ID
		{
			napi_value key;
			napi_create_string_utf8(
			  env, "id", NAPI_AUTO_LENGTH, &key);
			napi_value value;
			napi_create_uint32(env, p_kw->kw_ID, &value);

			napi_set_property(env, single_result_dict, key, value);
		}

		// wordString
		{
			napi_value key;
			napi_create_string_utf8(
			  env, "wordString", NAPI_AUTO_LENGTH, &key);
			napi_value value;
			napi_create_string_utf8(
			  env,
			  p_kw->synset_strs.front().c_str(),
			  NAPI_AUTO_LENGTH,
			  &value);

			napi_set_property(env, single_result_dict, key, value);
		}

		// description
		{
			napi_value key;
			napi_create_string_utf8(
			  env, "description", NAPI_AUTO_LENGTH, &key);
			napi_value value;
			napi_create_string_utf8(
			  env, p_kw->desc.c_str(), NAPI_AUTO_LENGTH, &value);

			napi_set_property(env, single_result_dict, key, value);
		}

		// exampleFrames
		{
			napi_value key;
			napi_create_string_utf8(
			  env, "exampleFrames", NAPI_AUTO_LENGTH, &key);
			napi_value value;
			napi_create_array(env, &value);

			size_t ii{ 0 };
			for (auto &&p_frame : p_kw->top_ex_imgs) {
				if (ii >= example_count) {
					break;
				}

				napi_value v;
				napi_create_string_utf8(
				  env,
				  (path_prefix + p_frame->filename).c_str(),
				  NAPI_AUTO_LENGTH,
				  &v);
				napi_set_element(env, value, ii, v);
				++ii;
			}

			napi_set_property(env, single_result_dict, key, value);
		}

		napi_set_element(env, result_arr, i, single_result_dict);

		++i;
	}

	return Napi::Object(env, result_arr);
}

Napi::Value
SomHunterNapi::login_to_dres(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int length = info.Length();
	if (length != 0) {
		Napi::TypeError::New(env,
		                     "Wrong number of parameters "
		                     "(SomHunterNapi::login_to_dres)")
		  .ThrowAsJavaScriptException();
	}

	bool result{ false };
	try {
		debug("API: CALL \n\t login_to_dres()");

		result = somhunter->login_to_dres();

		debug(
		  "API: RETURN \n\t login_to_dres()\n\t\result = " << result);

	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}

	napi_value res;
	napi_get_boolean(env, result, &res);

	return Napi::Object(env, res);
}

Napi::Value
SomHunterNapi::is_som_ready(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int length = info.Length();
	if (length != 0) {
		Napi::TypeError::New(env,
		                     "Wrong number of parameters "
		                     "(SomHunterNapi::is_som_ready)")
		  .ThrowAsJavaScriptException();
	}

	bool is_ready{ false };
	try {
		debug("API: CALL \n\t som_ready()");

		is_ready = somhunter->som_ready();

		debug(
		  "API: RETURN \n\t som_ready()\n\t\tis_ready = " << is_ready);

	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}

	napi_value result;
	napi_get_boolean(env, is_ready, &result);

	return Napi::Object(env, result);
}

Napi::Value
SomHunterNapi::submit_to_server(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int length = info.Length();

	if (length != 1) {
		Napi::TypeError::New(env, "Wrong number of parameters")
		  .ThrowAsJavaScriptException();
	}

	ImageId frame_ID{ info[0].As<Napi::Number>().Uint32Value() };

	try {
		debug("API: CALL \n\t submit_to_server\n\t\frame_ID = "
		      << frame_ID);

		somhunter->submit_to_server(frame_ID);
	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}

	return Napi::Object{};
}

Napi::Value
SomHunterNapi::construct_result_from_SearchContext(
  Napi::Env &env,
  const SearchContext &search_ctx)
{

	// Return structure
	napi_value result_obj;
	napi_create_object(env, &result_obj);

	{ /* *** textQueries ***
	  textQueries: {
		main: string; // The mail query
		sub: string[] // Sub-frame queries
	  }[] */
		napi_value key;
		napi_create_string_utf8(
		  env, "textQueries", NAPI_AUTO_LENGTH, &key);

		napi_value value_arr;
		napi_create_array(env, &value_arr);
		{
			// \todo This should be generalized in the
			// future

			std::string q0{};
			std::string q1{};

			// Scan the query string
			const auto &query{ search_ctx.last_text_query };
			auto idx{ query.find(">>") };

			// If temporal
			if (idx != std::string::npos) {
				q0 = query.substr(0, idx);
				q1 = query.substr(idx + 2);
			}
			// Else simple
			else {
				q0 = query;
			}

			// Conert them to the JS types
			napi_value q0_napi;
			napi_value q1_napi;
			napi_create_string_utf8(
			  env, q0.c_str(), NAPI_AUTO_LENGTH, &q0_napi);
			napi_create_string_utf8(
			  env, q1.c_str(), NAPI_AUTO_LENGTH, &q1_napi);
			napi_set_element(env, value_arr, 0, q0_napi);
			napi_set_element(env, value_arr, 1, q1_napi);
		}

		napi_set_property(env, result_obj, key, value_arr);
	}

	{ /* *** displayType ***
	   displayType: string; */
		napi_value key;
		napi_create_string_utf8(
		  env, "displayType", NAPI_AUTO_LENGTH, &key);

		auto curr_disp_type{ search_ctx.curr_disp_type };
		auto disp_string{ disp_type_to_str(curr_disp_type) };

		napi_value disp_string_napi;
		napi_create_string_utf8(env,
		                        disp_string.c_str(),
		                        NAPI_AUTO_LENGTH,
		                        &disp_string_napi);

		napi_set_property(env, result_obj, key, disp_string_napi);
	}

	{ /* *** screenshotFilepath ***
	   screenshotFilepath: string; */
		napi_value key;
		napi_create_string_utf8(
		  env, "screenshotFilepath", NAPI_AUTO_LENGTH, &key);

		auto str{ search_ctx.screenshot_fpth };

		napi_value str_napi;
		napi_create_string_utf8(
		  env, str.c_str(), NAPI_AUTO_LENGTH, &str_napi);

		napi_set_property(env, result_obj, key, str_napi);
	}

	{ /* *** ID *** */
		napi_value key;
		napi_create_string_utf8(env, "id", NAPI_AUTO_LENGTH, &key);

		size_t ID{ search_ctx.ID };

		napi_value ID_napi;
		napi_create_uint32(env, ID, &ID_napi);

		napi_set_property(env, result_obj, key, ID_napi);
	}

	{ /* *** likedFrames *** */
		napi_value key;
		napi_create_string_utf8(
		  env, "likedFrames", NAPI_AUTO_LENGTH, &key);

		napi_value likes_arr;
		napi_create_array(env, &likes_arr);

		size_t i{ 0 };
		for (auto &&f_ID : search_ctx.likes) {

			const VideoFrame &f{ somhunter->get_frame(f_ID) };
			auto fr{ VideoFrame_to_res(env,
				                   &f,
				                   search_ctx.likes,
				                   search_ctx.bookmarks,
				                   "") };

			napi_set_element(env, likes_arr, i, fr);
			++i;
		}
		napi_set_property(env, result_obj, key, likes_arr);
	}

	{ /* *** bookmarkedFrames *** */
		napi_value key;
		napi_create_string_utf8(
		  env, "bookmarkedFrames", NAPI_AUTO_LENGTH, &key);

		napi_value likes_arr;
		napi_create_array(env, &likes_arr);

		size_t i{ 0 };
		for (auto &&f_ID : search_ctx.bookmarks) {

			const VideoFrame &f{ somhunter->get_frame(f_ID) };
			auto fr{ VideoFrame_to_res(env,
				                   &f,
				                   search_ctx.likes,
				                   search_ctx.bookmarks,
				                   "") };

			napi_set_element(env, likes_arr, i, fr);
			++i;
		}
		napi_set_property(env, result_obj, key, likes_arr);
	}

	return Napi::Object(env, result_obj);
}

Napi::Value
SomHunterNapi::get_search_context(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int arg_count = info.Length();
	if (arg_count != 1) {
		Napi::TypeError::New(env, "Wrong number of arguments!")
		  .ThrowAsJavaScriptException();
	}

	// Convert arguments
	std::string user_token{ info[0].As<Napi::String>().Utf8Value() };

	try {
		// << Core >>
		const SearchContext &search_context =
		  somhunter->get_search_context(/*user_token*/);
		// << Core >>

		// Return the processed result
		return construct_result_from_SearchContext(env, search_context);
	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}

	return Napi::Object{};
}

Napi::Value
SomHunterNapi::construct_result_from_UserContext(Napi::Env &env,
                                                 const UserContext &user_ctx)
{
	// Return structure
	napi_value result_obj;
	napi_create_object(env, &result_obj);

	{ /* *** search *** */
		napi_value key;
		napi_create_string_utf8(env, "search", NAPI_AUTO_LENGTH, &key);

		// Parse the search context
		auto val{ construct_result_from_SearchContext(env,
			                                      user_ctx.ctx) };
		napi_set_property(env, result_obj, key, val);
	}

	{ /* *** history *** */

		napi_value key;
		napi_create_string_utf8(env, "history", NAPI_AUTO_LENGTH, &key);

		// Parse the search context
		auto val{ construct_result_from_SearchHistory(
		  env, user_ctx.history) };
		napi_set_property(env, result_obj, key, val);
	}

	return Napi::Object(env, result_obj);
}

Napi::Value
SomHunterNapi::get_user_context(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int arg_count = info.Length();
	if (arg_count != 1) {
		Napi::TypeError::New(env, "Wrong number of arguments!")
		  .ThrowAsJavaScriptException();
	}

	// Convert arguments
	std::string user_token{ info[0].As<Napi::String>().Utf8Value() };

	try {
		// << Core >>
		const UserContext &user_context =
		  somhunter->get_user_context(/*user_token*/);
		// << Core >>

		// Return the processed result
		return construct_result_from_UserContext(env, user_context);
	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}

	return Napi::Object{};
}

Napi::Value
SomHunterNapi::switch_search_context(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	Napi::HandleScope scope(env);

	// Process arguments
	int arg_count = info.Length();
	if (arg_count != 5) {
		Napi::TypeError::New(env, "Wrong number of arguments!")
		  .ThrowAsJavaScriptException();
	}

	// Convert arguments
	std::string user_token{ info[0].As<Napi::String>().Utf8Value() };
	size_t search_ctx_ID{ info[1].As<Napi::Number>().Uint32Value() };
	size_t src_search_ctx_ID{ info[2].As<Napi::Number>().Uint32Value() };
	std::string screenshot_fpth{ info[3].As<Napi::String>().Utf8Value() };
	std::string label{ info[4].As<Napi::String>().Utf8Value() };

	try {
		// << Core >>
		const UserContext &user_context =
		  somhunter->switch_search_context(
		    /*user_token, */ search_ctx_ID,
		    src_search_ctx_ID,
		    screenshot_fpth,
		    label);
		// << Core >>

		// Return the processed result
		return construct_result_from_UserContext(env, user_context);
	} catch (const std::exception &e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
	}

	return Napi::Object{};
}
