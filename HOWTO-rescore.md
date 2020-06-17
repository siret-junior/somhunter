
# HOW-TO: Adding a new reascore function

This tutorial shows, how new rescore function can be implemented. 

Rescore functions are placed in the backend in module RelevanceScore (e. g. `apply_bayes` in `core/src/RelevanceScores.cpp`) or its modules (e. g. `core/src/KeywordRanker.h` and `.cpp`). We will use adding new relevance feedback function as an example. Our new relevance feedback function takes in ids of selected relevant frames and based on their similarity in DatasetFeatures are computed new scores.

## 1. Provide all the input data, which the new rescore function needs. 
In our example, we need selected relevant frames, which are already implemented (see `likes` in `core/src/SomHunter.h`), because they are same as for `apply_bayes` function. If your new rescore function needs any additional input data, you need to connect this new feature with the UI (similiarly as in [HOW-TO: Adding a new display type](HOWTO-display.md)).

## 2. Implementing new rescore function. 
If your new function is rather simple, it can be placed in `core/src/RelevanceScore.h` and `.cpp`. Otherwise, we recommend creating a new backend module (in case loading some additional data at the start of somhunter, etc.). Our example function is simple, so we will create a new function in the `core/src/RelevanceScore.h` and `.cpp`. 
Example code:
`core/src/RelevanceScore.h`
```
void apply_simple(std::set<ImageId> likes,
	                 const DatasetFeatures &features);
```

`core/src/RelevanceScore.cpp`
```
void
ScoreModel::apply_simple(std::set<ImageId> likes,
                        const DatasetFeatures &features)
{
	if (likes.empty())
		return;
	
  for (float &s : scores) {
    float sum = 0;

    for (ImageId oi : likes)
      sum += features.d_dot(ii, oi);

		s *= sum;
	}

  normalize();
}
```

## 3. Connecting main backend module SomHunter and our new function. 
Relevance scores are updated every time function rescore is called. At first, we call our new rescore function with input data, which we discussed in section 1. 
We will modify `rescore` in `core/src/SomHunter.cpp` as follows:
```
void
SomHunter::rescore(std::string text_query)
{
	submitter.poll();

	// Rescore text query
	rescore_keywords(std::move(text_query));

	// Rescore relevance feedback
	if (!likes.empty())
  {
    scores.apply_simple(likes, features);
  }

	// Start SOM computation
	som_start();

	// Update search context
	shown_images.clear();

	// Reset likes
	likes.clear();
	for (auto &fr : frames) {
		fr.liked = false;
	}

	auto top_n = scores.top_n(frames,
	                          TOPN_LIMIT,
	                          config.topn_frames_per_video,
	                          config.topn_frames_per_shot);
                            
	submitter.submit_and_log_rescore(frames,
	                                 scores,
	                                 used_tools,
	                                 current_display_type,
	                                 top_n,
	                                 last_text_query,
	                                 config.topn_frames_per_video,
	                                 config.topn_frames_per_shot);
}
```
## 4. Logging
Now we have working rescore and the last step is to add this new feature to the logging system. Logging system takes in structure `UsedTools` and based on this parameter it fills categories and types to the logs. Our example function is similar to the bayes rescore function, so we will use the same type. If you are going to implement a different type of rescore function, you have to extend the `UsedTools` structure and fill in correct categories and types in function `submit_and_log_rescore` in `core/src/Submitter.cpp`. Please consult logging details with VBS standard for the current year.

Function `rescore` in `core/src/SomHunter.cpp` with filled `UsedCategories`:
```
void
SomHunter::rescore(std::string text_query)
{
	submitter.poll();

	// Rescore text query
	rescore_keywords(std::move(text_query));

	// Rescore relevance feedback
	if (!likes.empty())
  {
    scores.apply_simple(likes, features);
    used_tools.bayes_used = true;
  }

	// Start SOM computation
	som_start();

	// Update search context
	shown_images.clear();

	// Reset likes
	likes.clear();
	for (auto &fr : frames) {
		fr.liked = false;
	}

	auto top_n = scores.top_n(frames,
	                          TOPN_LIMIT,
	                          config.topn_frames_per_video,
	                          config.topn_frames_per_shot);
                            
	submitter.submit_and_log_rescore(frames,
	                                 scores,
	                                 used_tools,
	                                 current_display_type,
	                                 top_n,
	                                 last_text_query,
	                                 config.topn_frames_per_video,
	                                 config.topn_frames_per_shot);
}
```

