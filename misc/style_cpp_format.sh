#!/bin/sh
cd `dirname $0` #lol
echo `dirname $0`
clang-format -style=file -verbose -i ../core/src/*.hpp ../core/src/*.h ../core/src/*.cpp ../core/*.h ../core/*.cpp
