#!/bin/sh
cd `dirname $0` #lol
clang-format -style="{BasedOnStyle: Mozilla, UseTab: ForIndentation, IndentWidth: 8, TabWidth: 8, AccessModifierOffset: -8, PointerAlignment: Right}" -verbose -i ../core/src/*.hpp ../core/src/*.h ../core/src/*.cpp ../core/*.h ../core/*.cpp
