FROM nvidia/cuda:11.1.1-cudnn8-devel-ubuntu20.04

RUN apt-get update
RUN export DEBIAN_FRONTEND=noninteractive && \
	 apt install -y git nano cmake pkg-config


ENV LD_LIBRARY_PATH=core/somhunter-core/3rdparty/libtorch/lib/:/usr/local/lib
ENV PKG_CONFIG_PATH=/usr/local/lib/pkgconfig


WORKDIR /opt/somhunter/



