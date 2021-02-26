#!/bin/bash

docker build -t somhunter:base -f Dockerbase .
docker run -ti --rm -p8888:8888 -p3000:3000 -p 5000:5000 -v `pwd`:'/opt/somhunter':Z somhunter:base