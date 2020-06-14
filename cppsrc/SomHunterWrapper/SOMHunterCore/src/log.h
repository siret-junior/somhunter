
#ifndef log_h
#define log_h

#include "config.h"

#include <fstream>
#include <iostream>
#include <sstream>
#include <string>



#if LOGLEVEL > 0

#define _write_log(level, x)                                                   \
	do {                                                                   \
		std::cerr << level << x << "\n\t(" << __func__                 \
		          << " in " __FILE__ " :" << __LINE__ << ")"           \
		          << std::endl;                                        \
	} while (0)

#define warn(x) _write_log("* ", x)
#else
#define warn(x)
#define _write_log(level, x)
#endif

#if LOGLEVEL > 1
#define info(x) _write_log("- ", x)
#else
#define info(x)
#endif

#if LOGLEVEL > 2
#define debug(x) _write_log(". ", x)
#else
#define debug(x)
#endif

#endif
