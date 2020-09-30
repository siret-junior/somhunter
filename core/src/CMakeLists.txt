
#pthreads
set(THREADS_PREFER_PTHREAD_FLAG ON)
find_package(Threads REQUIRED)

# cURL
find_package(CURL REQUIRED) 
include_directories(${CURL_INCLUDE_DIR})

SET(HEADERS
	json11.hpp
  common.h
	config.h
	distfs.h
	utils.h
	log.h
	config_json.h
	tests.hpp
	use_intrins.h
	SOM.h
	AsyncSom.h
	DatasetFeatures.h
	DatasetFrames.h
	KeywordRanker.h
	RelevanceScores.h
  SomHunter.h
	Submitter.h
	Filters.h
	UserContext.h
	SearchContext.h
)

SET(SOURCES
	${HEADERS}
	json11.cpp
	main.cpp
	SOM.cpp
	AsyncSom.cpp
	DatasetFeatures.cpp
	DatasetFrames.cpp
	KeywordRanker.cpp
	RelevanceScores.cpp
  SomHunter.cpp
	Submitter.cpp
	Filters.cpp
	UserContext.cpp
	SearchContext.cpp
)

#create the program
add_executable(somhunter
	${TextExample_RESOURCES}
	${SOURCES}
	${HEADERS}
	)

set_target_properties(somhunter PROPERTIES CXX_STANDARD 17)

target_link_libraries(somhunter PRIVATE
	${CURL_LIBRARIES}
    Threads::Threads
    )
