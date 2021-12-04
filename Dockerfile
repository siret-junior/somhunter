FROM ubuntu:20.04

ENV TZ=Europe/Prague
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt -q update
RUN apt install -y --no-install-recommends software-properties-common python3 parallel 
RUN apt install -y --no-install-recommends build-essential nodejs npm pkg-config 
RUN apt install -y --no-install-recommends libcurl4-openssl-dev libopencv-dev libcpprest-dev
RUN apt install -y python3-pip

# Install the latest CMake
#   - https://blog.kitware.com/cmake-python-wheels/
RUN pip3 install --upgrade cmake

RUN rm -fr /var/lib/apt /var/cache/apt

ADD . /opt/somhunter
WORKDIR /opt/somhunter

RUN sh install.sh

EXPOSE 8080 8081 8082
