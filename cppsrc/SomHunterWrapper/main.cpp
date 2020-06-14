
#include <napi.h>

#include "SomHunterWrapper.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  return SomHunterWrapper::Init(env, exports);
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, InitAll)
