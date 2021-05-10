# SOMHunter Video Search Tool

SOMHunter consists of **three main parts** — [Core](https://github.com/siret-junior/somhunter-core), [Data Server](https://github.com/siret-junior/somhunter-data-server/) and [UI](https://github.com/siret-junior/somhunter-ui/).

## Prerequisites
- Python 3
- Node.js (with npm)
- Ember.js (also CLI tools)


## Build
```sh
# Clone with submodules
git clone --recurse-submodules https://github.com/FrankMejzlik/somhunter
```

The core is built with CMake which and expects some dependencies. Before going further, go to the [core project](https://github.com/siret-junior/somhunter-core) and build the core. Whatever `somhunter` binary will be placed inside `somhunter-core/build/` directory will be used during `run` script.

With core built, just run the following and watch for errors! 
```sh
sh install.sh
```


# **[SOMHunter Core](https://github.com/siret-junior/somhunter-core)**
This is the place of the main logic — all the models and scoring functions happen there. Moreover it also runs the HTTP server handling requests that interact with the core (usually called by the UI). 

## Run
```sh
sh run-core.sh
```

## HTTP API
We try to follow the OpenAPI specification for whitch there is available HTTP documentation at [http://loacalhost:8888/api/](http://loacalhost:8888/api/) (if your core is running locally at port 8888). For more information check its README file.


# **[SOMHunter Data Server](https://github.com/siret-junior/somhunter-data-server/)**

## Run
> **IMPORTANT:**
> Because data server is running on HTTP/2 it uses self-signed certificate. When running for the first time your browser may complain about it and won't respond to the UI. Just access some URL of the data server manually (e.g.`https://localhost:8889/`) and "accept the risk".

```sh
sh run-data-server.sh
```


# **[SOMHunter UI](https://github.com/siret-junior/somhunter-ui/)**

## Run
```sh
sh run-ui.sh
```


# Important pointers
## Collage logging
* Every collage rescore is logged into `logs/collages/<timestamp>/*`.
* You can find there binary dump (e.g. `Collage_instance_serialized.bin`) that you can use to simulate that query when working on `somhunter-core` without the UI.
    * Just look for the `TEST_COLLAGE_QUERIES` define inside `somhunter-core` to see how you can use those.
* Used images are there as well as JFIFs.
* Query info is inside the `query_info.json`


