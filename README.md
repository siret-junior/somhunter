# SOMHunter opensource ![Node.js CI](https://github.com/siret/somhunter/workflows/Node.js%20CI/badge.svg)

# TLDR Installation
1. Clone & change to the correct branch
```
  git clone https://github.com/FrankMejzlik/somhunter --recurse-submodules
  cd somhunter
  git checkout -b integrate-collage-hunter origin/integrate-collage-hunter --recurse-submodules
```
2. Run `npm install`
    * This will take some time since it also downloads models and libraries
3. Models should be downloaded & installed during the `npm install`
    * Check their presence in `data/nn_models/`
    * If not, place them manually  (e.g. `traced_Resnet152.pt` & `traced_Resnext101.pt`)
4. The **ITEC dataset** is bundled directly inside. 
    * If you want to chhange it, modify `config.json` accordingly.
    * Scripts should be creating according symlinks to frames/thumbnais inside `ui/public/` & `ui/build/`.

> **NOTE: All these tasks are inside `package.json` & `gulpfile.js`.**

# Run
> **IMPORTANT:**
> When running for the first time your browser may complain about self-signed certificate and won't respond to the UI. Just access some URL of the server (e.g.`https://localhost:8888`) and "accept the risk" (HTTPS is now truned off, it should be OK, but good to know).

## Run the server
> NOTE: For the first time, it needs to be launched before the UI, it generates config file into the `ui` directory.
```bash
sh run_server.sh # Includes LD_LIBRARY_PATH export
# OR
npm run server # Beware that libtorch SOs must be found

# To rebuild the C++ core
npm run build-server
```

## Run the UI
```bash
sh run_ui.sh
# OR
npm run build-ui # To rebuild the UI 
npm run ui:prod
```

> **NOTE**
> In development mode of the UI, rescore will trigger also reload, because there is running auto-reload and rescore generates a new file - screenshot. This does not happen in production build.


# Important pointers
## Collage logging
* Every collage rescore is logged into `logs/collages/<timestamp>/*`.
* You can find there binary dump (e.g. `Collage_instance_serialized.bin`) that you can use to simulate that query when working on `somhunter-core` without the UI.
    * Just look for the `TEST_COLLAGE_QUERIES` define inside `somhunter-core` to see how you can use those.
* Used images are there as well as JFIFs.
* Query info is inside the `query_info.json`

## Working on core
- With collage dumps available it should be easy to work only on `somhunter-core` while developing it.
- It is build using `cmake`.
- For more info head to `core/somhunter-core/README.md`.

## Errors in build scripts
Everything regarding the build process is in these files:
* `core/binding.gyp` - this is build system responsible for C++ `somhunter-core` native addon compilation
    * It is possible that you will encounter some errors, just fix whatever you need inside this file and fly!
* `package.json` - npm start * scripts 
* `gulpfile.js` - More complex task that are invoked from scripts inside `package.json`



---


This is an open-source version of the SOMHunter video search and retrieval
engine, slightly simplified from the prototype that was featured at Video
Browser Showdown 2020 in Daejeon, Korea (see https://videobrowsershowdown.org/
).

Main features:

- a very simple demonstration dataset is packed in the repository, indexed V3C1
  dataset will be available for download
- keyword search, similarity-based search
- several ways of browsing and re-scoring the results (including SOMs)
- VBS-compatible submission and logging API clients

SOMHunter is licensed as free software, under the GPLv2 license. This grants
you freedom to use the software for many research purposes and publish the
results. For exploring and referencing the original work, you may find some of
the following articles helpful:

- Kratochvíl, M., Veselý, P., Mejzlík, F., & Lokoč, J.
  (2020, January).
  [SOM-Hunter: Video Browsing with Relevance-to-SOM Feedback Loop](https://link.springer.com/chapter/10.1007/978-3-030-37734-2_71).
  In *International Conference on Multimedia Modeling* (pp. 790-795). Springer, Cham.
- Mejzlík, F., Veselý, P., Kratochvíl, M., Souček, T., & Lokoč, J.
  (2020, June).
  [SOMHunter for Lifelog Search](https://dl.acm.org/doi/abs/10.1145/3379172.3391727).
  In *Proceedings of the Third Annual Workshop on Lifelog Search Challenge* (pp. 73-75).

## Try SOMHunter from Docker ![image size](https://img.shields.io/docker/image-size/exaexa/somhunter) ![latest version](https://img.shields.io/docker/v/exaexa/somhunter) ![pulls](https://img.shields.io/docker/pulls/exaexa/somhunter)


You can get a working SOMHunter copy from Docker:
```sh
docker pull exaexa/somhunter:v0.1
docker run -ti --rm -p8080:8080 exaexa/somhunter:v0.1
```

After that, open your browser at http://localhost:8080, and use login `som` and password `hunter`.

![SOMHunter interface](media/screenshot.jpg)

## Running the UI
The UI is located inside the `ui` directory. After you launch the backend server, just cd to the `ui` directory and run `npm run build` to build the production static website. After that, just serve it with an arbitrary server (e.g. `serve -s build`).

To run the development server, run `npm run start`.

The UI needs the auto-generated config file `ui/src/__config_generated__.json` from the API server. The server generates this upon launching. Therefore, if you edit something in the API server that is related to the config file, you need to run it and then rebuild the UI production files (in order to correctly use the new config file).

The UI expects directories `thumbs` and `frames` in the public root (relative either to the `build` or `public` directory). 

Please be aware that if the symlink to `frames` and/or `thumbs` is present in the `public` directory when running `npm run build`, it will try to copy the contents to the `build` directory which takes a lot of time and is unnecessary. Just remove the symlink from the `public` directory before running the `npm run build`.

### Server certificates
Please bear in mind that by default the server uses self-signed certificate and therefore requests to the back-end will be probbably rejected, unless you give this certificate an exception (or use normal one). To do so, just add the certificate into the exceptions (you can directly "visit" any URL that starts with the server URL, like `www.loaclhost:8888/whatever` and you should get a warning popup).

## Installation from source

Prerequisites:

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

### Getting the dependencies on UNIX systems

You should be able to install all dependencies from the package management. On
Debian-based systems (including Ubuntu and Mint) the following should work:

```
apt-get install build-essential libcurl4-openssl-dev nodejs yarnpkg
```

The build system uses `pkg-config` to find libCURL -- if that fails, either
install the CURL pkgconfig file manually, or customize the build configuration
in `core/binding.gyp` to fit your setup.

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
filling the appropriate paths in `core/binding.gyp`.

### Build problems

We have tested SOMHunter on Windows and several different Linux distributions,
which should cover a majority of target environments. Please report any errors
you encounter using the GitHub issue tracker, so that we can fix them (and
improve the portability of SOMHunter).

### Building the Docker image

The installation is described in `Dockerfile`; you should be able to get a
working, correctly tagged (and possibly customized) image by running this in
your directory:
```sh
docker build -t somhunter:$(git describe --always --tags --dirty=-$USER-$(date +%Y%m%d-%H%M%S)) .
```

## Customizing SOMHunter

The program is structured as follows:

- The frontend requests are routed in `app.js` to views and actions in `routes/somhunter.js`, display-specific routes are present in `routes/endpoints.js`
- The views (for the browser) are rendered in `views/somhunter.ejs`
- Node.js "frontend" communicates with C++ "backend" that handles the main data operations; the backend source code is in `core/`; the main API is in `core/SomHunterNapi.h` (and `.cpp`)
- The backend implementation is present in `core/src/` which contains the following modules (`.cpp` and `.h`):
  - `SomHunter` -- main data-holding structure with the C++ version of the wrapper API
  - `Submitter` -- VBS API client for submitting search results for the competition, also contains the logging functionality
  - `DatasetFrames` -- loading of the dataset description (frame IDs, shot IDs, video IDs, ...)
  - `DatasetFeatures` -- loading of the dataset feature matrix
  - `KeywordRanker` -- loading and application of W2VV keywords (see Li, X., Xu, C., Yang, G., Chen, Z., & Dong, J. (2019, October). [W2VV++ Fully Deep Learning for Ad-hoc Video Search](https://dl.acm.org/doi/pdf/10.1145/3343031.3350906). In *Proceedings of the 27th ACM International Conference on Multimedia* (pp. 1786-1794).)
  - `RelevanceScores` -- maintenance of the per-frame scores and feedback-based re-ranking
  - `SOM` and `AsyncSom` -- SOM implementation, background worker that computes the SOM

Additional minor utilities include:
  - `config.h` that contains various `#define`d constants, including file paths
  - `log.h` which defines a relatively user-friendly logging with debug levels
  - `use_intrins.h` and `distfs.h` define fast SSE-accelerated computation of vector-vector operations (provides around 4x speedup for almost all computation-heavy operations)
  - `main.cpp`, which is __not__ compiled-in by default, but demonstrates how to run the SOMHunter core as a standalone C++ application.

### HOW-TOs

- [Adding a new display type](HOWTO-display.md)
- [Modifying the re-scoring functionality](HOWTO-scores.md)

## Datasets

The repository contains a (very small) pre-extracted indexed dataset (see
https://doi.org/10.1109/ICMEW.2015.7169765 for dataset details). That should be
ready to use.

We can provide a larger pre-indexed dataset based on the [V3C1 video
collection](https://link.springer.com/chapter/10.1007/978-3-030-05710-7_29),
but do not provide a direct download due to licensing issues. Please contact us
to get a downloadable link. You will need to have the TRECVID data use
agreement signed; see
https://www-nlpir.nist.gov/projects/tv2019/data.html#licenses for details.

### Using custom video data

You may set up the locations of the dataset files in `config.json`. The
thumbnails of the extracted video frames must be placed in directory
`public/thumbs/`, so that they are accessible from the browser. (You may want
to use a symbolic link that points to the thumbnails elsewhere, in order to
save disk space and IO bandwidth.)

Description of extracting data from custom dataset is available in directory `extractor/` with a [separate README](extractor/README.md).
