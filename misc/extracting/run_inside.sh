#!/bin/bash

echo 'installing opencv'
cd misc/extracting/opencv
mkdir build && cd build
cmake -D CMAKE_BUILD_TYPE=Release OPENCV_EXTRA_MODULES_PATH=../../opencv_contrib  -D OPENCV_GENERATE_PKGCONFIG=ON -D CMAKE_INSTALL_PREFIX=/usr/local ..
make -j8
make install

cd ../../../..


echo 'compiling extractor'

export LD_LIBRARY_PATH=core/somhunter-core/3rdparty/libtorch/lib/:/usr/local/lib
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig

g++ -std=c++17 misc/extracting/extract_features.cpp -I core/somhunter-core/3rdparty/libtorch/include -I core/somhunter-core/3rdparty/libtorch/include/torch/csrc/api/include -L core/somhunter-core/3rdparty/libtorch/lib -lc10 -ltorch -ltorch_cpu  -lstdc++fs -D_GLIBCXX_USE_CXX11_ABI=1 `pkg-config --cflags --libs opencv4` -o cpp_inference


echo 'running extraction'
./cpp_inference
