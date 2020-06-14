
#include "Features.h"

#include <exception>
#include <fstream>

#include "config_json.h"
#include "log.h"


ImageFeatures::ImageFeatures(const Frames &p, const Config& config)
  : n(p.size())
  , features_dim(config.features_dim)
{
	data.resize(features_dim * n);
	std::ifstream in(config.features_file, std::ios::binary);
	if (!in.good()) {
		warn("Features file doesn't look good");
		throw std::runtime_error("missing features file");
	}

	// Skip the header
	in.ignore(config.features_file_data_off);

	// the heck. ifstream::read parameter types should be punished.
	if (!in.read(reinterpret_cast<char *>(data.data()),
	             sizeof(float) * data.size()))
		warn("Feature matrix reading problems");
	else
		info("Feature matrix loaded OK");
}
