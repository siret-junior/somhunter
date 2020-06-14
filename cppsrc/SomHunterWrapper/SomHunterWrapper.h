#pragma once

#include "SomHunter.h"
#include <napi.h>

class SomHunterWrapper : public Napi::ObjectWrap<SomHunterWrapper>
{
public:
	static Napi::Object Init(Napi::Env env, Napi::Object exports);

	SomHunterWrapper(const Napi::CallbackInfo &info);

private:
	static Napi::FunctionReference constructor;
	SomHunter *actualClass_;

	Napi::Value get_display(const Napi::CallbackInfo &info);

	Napi::Value add_likes(const Napi::CallbackInfo &info);

	Napi::Value reset_all(const Napi::CallbackInfo &info);

	Napi::Value remove_likes(const Napi::CallbackInfo &info);

	Napi::Value autocomplete_keywords(const Napi::CallbackInfo &info);

	Napi::Value is_som_ready(const Napi::CallbackInfo &info);

	Napi::Value submit_to_server(const Napi::CallbackInfo &info);
};
