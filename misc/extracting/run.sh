#!/bin/bash

if [ ! -d opencv ]; then
	git clone https://github.com/opencv/opencv.git 
fi
if [ ! -d opencv_contrib ]; then
	git clone https://github.com/opencv/opencv_contrib.git 
fi

docker build -t extractor .
cd ../..
docker run -ti -v `pwd`:'/opt/somhunter':Z extractor sh misc/extracting/run_inside.sh
