# SOMHunter opensource ![Node.js CI](https://github.com/siret/somhunter/workflows/Node.js%20CI/badge.svg)

This is an open-source version of the SOMHunter video search and retrieval engine, slightly simplified from the prototype that was featured at Video Browser Showdown 2020 in Daejeon, Korea (see https://videobrowsershowdown.org/ ).

Main features:

- a very simple demonstration dataset is packed in the repository, indexed V3C1 dataset will be available for download
- keyword search, similarity-based search
- several ways of browsing and re-scoring the results (including SOMs)
- VBS-compatible submission and logging API clients

SOMHunter is licensed as free software, under the GPLv2 license. This grants you freedom to use the software for many research purposes and publish the results. For exploring and referencing the original work, you may find some of the following articles helpful:

- Kratochvíl, M., Veselý, P., Mejzlík, F., & Lokoč, J. (2020, January). [SOM-Hunter: Video Browsing with Relevance-to-SOM Feedback Loop](https://link.springer.com/chapter/10.1007/978-3-030-37734-2_71). In *International Conference on Multimedia Modeling* (pp. 790-795). Springer, Cham.
- Mejzlík, F., Veselý, P., Kratochvíl, M., Souček, T., & Lokoč, J. (2020, June). [SOMHunter for Lifelog Search](https://dl.acm.org/doi/abs/10.1145/3379172.3391727). In *Proceedings of the Third Annual Workshop on Lifelog Search Challenge* (pp. 73-75).

## Installation

Prerequisities:

- a working installation of Node.js with some variant of package manager
  (either `npm` or `yarn`)
- Python 3
- C++ compiler
- `libcurl` (see below for installation on various platforms)

After cloning this repository, change to the repository directory and run

```
npm install
npm run start
```

(Optionally replace `npm` with `yarn`.)

If everything goes all right, you can start browsing at http://localhost:8080/
. The site is password-protected by default, you can use the default login
`som` and password `hunter`, or set a different login in `config/user.js`.

![SOMHunter interface](media/screenshot.jpg)

### Getting the dependencies on UNIX systems

You should be able to install all dependencies from the package management. On
Debian-based systems (including Ubuntu and Mint) the following should work:

```
apt-get install build-essential libcurl4-openssl-dev nodejs yarnpkg
```

The build system uses `pkg-config` to find libCURL -- if that fails, either
install the CURL pkgconfig file manually, or customize the build configuration
in `cppsrc/SomHunterWrapper/binding.gyp` to fit your setup.

Similar (similarly named) packages should be available on most other distributions.

### Getting the dependencies on Windows

The build systems expects libCURL to reside in `c:\Program Files\curl\`.  You
may want to install it using
[vcpkg](https://docs.microsoft.com/en-us/cpp/build/vcpkg?view=vs-2019) as
follows:

- download and install `vcpkg`
- install and export libCURL:
```
vcpkg install curl:x64-windows
vcpkg export --raw curl:x64-windows
```
- copy the directory with the exported libCURL to `c:\Program Files\`.

Alternatively, you can use any working development installation of libCURL by
filling the appropriate paths in `cppsrc/SomHunterWrapper/binding.gyp`.

### Build problems

We have tested SOMHunter on Windows and several different Linux distributions,
which should cover a majority of target environments. Please report any errors
you encounter using the GitHub issue tracker, so that we can fix them (and
improve the portability of SOMHunter).

## Datasets

The repository contains a (very small) pre-extracted indexed dataset (see
https://doi.org/10.1109/ICMEW.2015.7169765 for dataset details). That should be
ready to use.

We can provide a larger pre-indexed dataset based on the [V3C1 video
collection](https://link.springer.com/chapter/10.1007/978-3-030-05710-7_29),
but do not provide a direct download due to licensing issues. Please contact us
to get a downloadable link.

### Using custom video data

You may set up the locations of the dataset files in `config.json`. The
thumbnails of the extracted video frames must be placed in directory
`public/thumbs/`, so that they are accessible from the browser. (You may want
to use a symbolic link that points to the thumbnails elsewhere, in order to
save disk space and IO bandwidth.)

Extraction of data from custom files proceeds as follows:

- TODO

## Customizing SOMHunter

The program is structured as follows:

- The frontend requests are routed to views and actions in `routes/somhunter.js`, display-specific routes are present in `routes/common/endpoints.js`
- The views (for the browser) are rendered in `views/somhunter.ejs`
- Node.js "frontend" communicates with C++ "backend" that handles the main data operations; the backend source code is in `cppsrc/`; the main API is in `cppsrc/SomHunterWrapper/SomHunterWrapper.h` (and `.cpp`)
- The backend implementation is present in `cppsrc/SomHunterWrapper/SOMHunterCore/src/` which contains the following modules (`.cpp` and `.h`):
  - `SomHunter` -- main data-holding structure with the C++ version of the wrapper API
  - `Submitter` -- VBS API client for submitting search results for the competition, also contains the logging functionality
  - `DatasetFrames` -- loading of the dataset description (frame IDs, shot IDs, video IDs, ...)
  - `DatasetFeatures` -- loading of the dataset feature matrix
  - `KeywordRanker` -- loading and application of W2VV keywords
  - `RelevanceScores` -- maintenance of the per-frame scores and feedback-based reranking
  - `SOM` and `AsyncSom` -- SOM implementation, background worker that computes the SOM

Additional minor utilities include:
  - `config.h` that contains various `#define`d constants, including file paths
  - `log.h` which defines a relatively user-friendly logging with debug levels
  - `use_intrins.h` and `distfs.h` define fast SSE-accelerated computation of vector-vector operations (provides around 4x speedup for almost all computation-heavy operations)
  - `main.cpp`, which is __not__ compiled-in by default, but demonstrates how to run the SOMHunter core as a standalone C++ application.

### How-To: connecting a new core feature with the UI
We'll use adding the nearest neighbours display (the KNN display) as an example to show you how to connect the UI with the core functions.

In general, you need to follow three steps:
1) Add the desired **public method** to the SomHunter class (located at `core/src/SomHunter.h`).
   - In our case, it is the `get_display` method which subsequently calls the `get_topKNN_display` method.
   - This method returns two iterators pointing to the desired frame range
2) Create **[N-API](https://nodejs.org/api/n-api.html) wrapper function** for this mew method inside the `core/SomHunterNapi.h` file (here specifically, we're talking about the `get_display` wrapper function).
   - The main purpose of this wrapper is to "translate" types and data structures between JavaScript and the C++.
   - Thanks to this wrapper the native addon behaves like any other JavaScript module.
3) Call the new method inside the front-end code to achieve desired results.
   - We call it inside the `getTopScreen` method in the `routes/endpoints.js` file where the handlers for all different requests are implemented.
   - These requests are created using [client-side scripts](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) (in `views/somhunter_event_handlers.ejs` that is included in the template `views/somhunter.ejs`)


Now let's take a look at that in more detail.
#### Adding the native method
This part is fairly straightforward. We just implement whatever function we want to use from the UI. For example, we implemented a function that will return frames for the requested screen. The function signature can look like this:
```
// FILE: core/src/SomHunter.h

// Returns the iterators pointing to the desired display frames
FramePointerRange get_display(DisplayType d_type, ImageId selected_image = 0, PageId page = 0);
```
#### Wrapping it using N-API
Now we have the function and we want to be able to call it from the JavaScript modules. Therefore we create a function that will handle the conversion from the C++ types to the JavaScript types. We do that in the `core/SomHunterNapi.h` and `core/SomHunterNapi.cpp` files. 

For more information about using the N-API, please refer to the [official documentation](https://nodejs.org/api/n-api.html).

In case of function for getting the Top-KNN display, it could look something like this:
```
// FILE: core/SomHunterNapi.h

/* Note that the input parameter is always the same. 
   We will extract the actual parameters from the `info` parameter. */
Napi::Value get_display(const Napi::CallbackInfo &info);
```
for it's implementation, please head to `core/SomHunterNapi.cpp`. 

This function takes up to 4 parameters from the JS and converts them into the C++ types. For example, this takes the first parameter and tries to convert it to the `std::string`:
```
std::string path_prefix{ info[0].As<Napi::String>().Utf8Value()
```

Then it calls the actual core function:
```
FramePointerRange dislpay_frames = this->actualClass_->get_display(disp_type, selected_image, page_num);
```

Then it converts provided output back to the JS types and returns it:
```
napi_value result; // Create a generic JS value
napi_create_object(env, &result); // Set it to be JS Object

// Set "page" key value
{
  napi_value key; 
  napi_create_string_utf8(env, "page", NAPI_AUTO_LENGTH, &key); // Set it to UTF-8 encoded string with this value

  napi_value value;
  napi_create_uint32(env, uint32_t(page_num), &value); // Set it to the uint32 value

  napi_set_property(env, result, key, value); // Add this key-value pair into the `result` object
}

.
.
.

return Napi::Object(env, result); // Construct the final Napi::Value instance with the result and return it
```

There are also other wrapper functions that you can use as an example of how to convert from/to all the different types.

#### Using the new function in the UI
We start with adding the button on every frame in every grid. It will call the `showTopDisplay` method on click event. The HTML for each frame in grid is returned by the `getThumbPrototype` function in `views/somhunter_event_handlers.ejs`. We add the `a` element:
```
// FILE: views/somhunter_event_handlers.ejs

function getThumbPrototype(likedStr, actionStr, id, src) {
  ...
    <a 
      class="button frame-in-grid-hover-btn show-knn" 
      onclick="showTopDisplay('topknn', ${id});event.cancelBubble=true;" 
      title="Show most similiar frames.">
      KNN
    </a>
  ...
}
```
Then we define the event handler called `showTopDisplay`. This method will create the request and then wait for the response so it can update the page accordingly. We define it as follows:
```
// FILE: views/somhunter_event_handlers.ejs

function showTopDisplay(type, id, thisFilename) {
  pageId = 0;
  if (type === undefined)
    type = "topn"
  let url = "/get_top_screen?pageId=" + pageId + "&type=" + type
  if (id !== undefined)
    url += "&frameId=" + id
  // Make the request
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) { throw Error(res.statusText); }
      return res.json()
    })
    .then((data) => {
      // Handle error
      if (data.error) {
        throw Error(data.error.message);
      }
      
      // Get updated view data
      viewData = data.viewData;
      putDocumentToState(viewData);

    })
    .catch((e) => {
      console.log("Error: " + JSON.stringify(e.message));
      showGlobalMessage(
        "Request failed!",
        JSON.stringify(e.message),
        5000,
        "e"
      );
    });
}
```


Now, every time we click the new button the request at the `/get_top_screen` URL will be created. We need to create a code that will resolve it. 

First, we head to the `app.js` where we register this GET call and we call the corresponding router. Because we will define our request handler inside the `routes/endpoints.js` module, we register this endpoint as:
```
// FILE: app.js

app.get("/get_top_screen", endpoints.getTopScreen);
```

Finally, the last part that is missing is the request handler itself. Let's go to the `routes/endpoints.js` and define it like this:
```
// FILE: routes/endpoints.js

exports.getTopScreen = function (req, res) {
  const sess = req.session;

  global.logger.log("info", req.query)
  let type = 'topn'
  if (req.query && req.query.type)
    type = req.query.type;

  let pageId = 0;
  if (req.query && req.query.pageId)
    pageId = Number(req.query.pageId);

  let frameId = 0;
  if (req.query && req.query.frameId)
    frameId = Number(req.query.frameId);

  let frames = [];
  // -------------------------------
  // Call the core
  const displayFrames = global.core.getDisplay(global.cfg.framesPathPrefix, type, pageId, frameId);
  frames = displayFrames.frames;
  // -------------------------------

  SessionState.switchScreenTo(sess.state, type, frames, frameId);

  let viewData = {};
  viewData.somhunter = SessionState.getSomhunterUiState(sess.state);

  res.status(200).jsonp({ viewData: viewData });
};
```

Now the new functionality should be working as expected.

### How-To: modifying the rescore functions

TODO prtrik
- ukazat novou funkci ktera rescoruje proste jako `sum(similarity(x,likes))`, treba `apply_simple`
- kam se vsude dopise ta akce
- jak se to prida do logu
