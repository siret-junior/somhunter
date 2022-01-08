# SOMHunter Video Search Tool

The SOMHunter system consists of **multiple parts**:
* [Core](https://github.com/siret-junior/somhunter-core)
* [Data Server](https://github.com/siret-junior/somhunter-data-server/) 
* [UI](https://github.com/siret-junior/somhunter-ui/)
* [Ranking Server](https://github.com/siret-junior/ranking-server/)
* [Documentation](https://github.com/siret-junior/somhunter-docs/)


## Getting the Sources
Do not forget to also **checkout any submodules** you wish to use (since `somhunter` repo itself are just references to submodules). 

If you don't want to run some submodule on the given machine, just do not checkout that submodule and leave the directory empty.
```sh
# Clone with ALL submodules (using SSH)
git clone --recurse-submodules git@github.com:siret-junior/somhunter.git

# Checkout just core & UI modules
git clone git@github.com:siret-junior/somhunter.git && cd somhunter
git submodule update --init --remote ./somhunter-core/ ./somhunter-ui/
```

## **Build & Run with Docker (recommended)**
```sh
# Build the images and install all (checked out) modules
sudo sh install-docker.sh RelWithDebubInfo #< Feel free to use Release or Debug build type as well

# Run all modules on this machine
docker-compose up
# .. or run just some (e.g. core + UI) like this
#           docker-compose services: core, ui, data-server, ranking-server
docker-compose up core ui

```

## **Build & Run (for bold & brave)**
Alright, you decided to build SOMHunter in your environment. First make sure that you have all the prerequisites installed.

### Prerequisites
- Python3 (with `python` alias pointing to the python3 binary)
    - with `urllib3` lib installed
- Node.js & `npm`
- [Ember.js](https://guides.emberjs.com/release/getting-started/quick-start/)


```sh
# This will attempt to install all the submodules (the first parameter specifies build type for the core)
sh install.sh RelWithDebugInfo

# Run all part separately (in different shells if you want)
sh scripts/run-core.sh
sh scripts/run-data-server.sh
sh scripts/run-ui.sh
sh scripts/run-ranking-server.sh

# Or run them in parallel in one terminal (requires the `parallel` utility)
sh run.sh
```
## **Using SOMHunter**

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

