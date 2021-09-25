# SOMHunter Video Search Tool

SOMHunter consists of **three main parts** — [Core](https://github.com/siret-junior/somhunter-core), [Data Server](https://github.com/siret-junior/somhunter-data-server/) and [UI](https://github.com/siret-junior/somhunter-ui/).


# Build
## Prerequisites
- Python 3 (with `python` alias pointing to python3 binary)
- Node.js (with `npm`)
- Ember.js

## Clone (recursive)
```sh
# Clone with submodules (using SSH)
git clone --recurse-submodules git@github.com:siret-junior/somhunter.git
```

## Build the tool
```sh
cd somhunter
sh install.sh

# Alternatively you can add string denoting what BUILD_TYPE you want, default is `RelWithDebInfo`.
sh install.sh Debug
```

# Run
Running SOMHunter means to run all the three components simultaneously.
```sh
# Run all part separately
sh run-core.sh
sh run-data-server.sh
sh run-ui.sh

# Or run then in parallel in one terminal
sh run.sh
```

After that, the UI script should inform you that the UI is running at some port. Just visit that in your browser. By default, these are of importance:
```sh
# Data server
https://localhost:8889

# HTTP Core
https://localhost:8888

# API Docs
https://localhost:8888/api/

# GUI
http://localhost:4200
```

> ## **Don't see the frames in the UI?**
> See *FAQ* below, point 1)


## *Core HTTP API*
We try to follow the OpenAPI specification for whith there is available HTTP documentation at [http://loacalhost:8888/api/](http://loacalhost:8888/api/) (if your core is running locally at port 8888). For more information check its README file.


# Architecture
## **[SOMHunter Core](https://github.com/siret-junior/somhunter-core)**
This is the place of the main logic — all the models and scoring functions happen there. Moreover, it also runs the HTTP server handling requests that interact with the core (usually called by the UI). 

## **[SOMHunter Data Server](https://github.com/siret-junior/somhunter-data-server/)**
Responsible for providing the shared data for SOMHunter instances (e.g. frames, videos).

## **[SOMHunter UI](https://github.com/siret-junior/somhunter-ui/)**
This is the GUI of the tool.


# FAQ
## 1.  *I don't see the frames rendered in the GUI.*
Because the data server is running on HTTP/2 it uses a self-signed certificate. When running for the first time your browser may complain about it and won't respond to the UI. Just access some URL of the data server manually (e.g.`https://localhost:8889/`) and "accept the risk".

## 2.  *I'm am getting an error saying \"python not found\".*
Do you have Python 3 installed? Maybe you don't have it aliased on `python` command. Consider aliasing it (or use something like `apt install python-is-python3`).

## 3.  *I am getting errors while building the core/data-server/ui.*
Please see the **FAQ** in the corresponding repository.

