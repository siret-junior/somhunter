cmake_minimum_required(VERSION 3.13)
project(SomHunter)

add_compile_definitions("NOMINMAX")
# Disable "unsafe" warnings in the MSVC toolchain
add_compile_definitions("_CRT_SECURE_NO_WARNINGS")

set(BUILD_PLUGINS_STATIC ON
    CACHE BOOL "prevent problems with dynamic builds")

add_subdirectory(src)
