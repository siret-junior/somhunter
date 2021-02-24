#!/bin/bash

docker build -t somhunter:base -f Dockerbase .
docker run -ti --rm -p8080:8080 -v ~/somhunter/:/host somhunter:bas