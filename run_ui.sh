#! /bin/bash

export LD_LIBRARY_PATH="core/somhunter-core/3rdparty/libtorch/lib"
npm run build-ui
npm run ui:prod