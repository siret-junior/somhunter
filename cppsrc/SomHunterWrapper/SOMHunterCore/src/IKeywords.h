
#ifndef I_KEYWORDS_H_
#define I_KEYWORDS_H_

#include <cassert>
#include <fstream>
#include <map>
#include <set>
#include <string>
#include <vector>

#include "Frames.h"
#include "Scores.h"
#include "config.h"

// d a t a
struct Keyword
{
	KeywordId kw_ID;
	SynsetId synset_ID;
	SynsetStrings synset_strs;
	KwDescription desc;

	/** Best representative images for this keyword */
	std::vector<ImageId> top_ex_imgs;
};

#endif // I_KEYWORDS_H_
