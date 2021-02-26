#! /bin/bash

export NODE_ENV="development"
export LD_LIBRARY_PATH="core/somhunter-core/3rdparty/libtorch/lib"
ldconfig "core/somhunter-core/3rdparty/libtorch/lib" # This may be necessary
npm run server