# SOMHunter Video Search Tool

The SOMHunter system consists of **multiple parts**:
* [Core](https://github.com/siret-junior/somhunter-core)
* [Data Server](https://github.com/siret-junior/somhunter-data-server/) 
* [UI](https://github.com/siret-junior/somhunter-ui/)
* [Ranking Server](https://github.com/siret-junior/ranking-server/)
* [Documentation](https://github.com/siret-junior/somhunter-docs/)


## Getting the Sources
Do not forget to also **checkout any submodules** you wish to use (since `somhunter` repo itself is just references to submodules). 
```sh
# Clone with ALL submodules (using SSH)
git clone --recurse-submodules git@github.com:siret-junior/somhunter.git && cd somhunter
```
If you don't want to run some submodule on the given machine, just do not checkout that submodule and leave the directory empty.
```sh
# For example, checkout just core & UI modules
git clone git@github.com:siret-junior/somhunter.git && cd somhunter
git submodule update --init --remote ./somhunter-core/ ./somhunter-ui/
```

## **Build & Run with Docker (recommended)**
> Requires Docker and Docker Compose installed

This will create four images, one for each submodule (core, data-server, ui, ranking server) It will run them and will install each part (download models, dependencies, build core, ...). After that you can run the containers (e.g. with `docker-compose`).
```sh
# Build the images and install all (checked out) modules 
sudo sh install-docker.sh RelWithDebubInfo #< Feel free to use Release or Debug build type as well

# Run all modules on this machine
sudo docker-compose up
# .. or run just some (e.g. core + UI) like this
#           docker-compose services: core, ui, data-server, ranking-server
sudo docker-compose up core ui

```
If you feel like you'd want to build it in your environment, please see [this guide](HOWTO-build-native.md).

## **Configuring SOMHunter**
> For more detailed documentation, please see our developer documentation inside [`somhunter-docs`](https://github.com/siret-junior/somhunter-docs) repository.

Almost everything can be configured inside the `./somhuner-core/config/config-core.json` file. 

### Different Dataset
First, you need the extracted metadata from [`extraction-pipeline`](https://github.com/siret-junior/extraction-pipeline). To know more about the formats, please see the developer documentation.

To plug in a different dataset, pay attention to the filepaths inside `datasets` dictionary. Feel free to check example configs that lie next to this file with the suffix saying what dataset it is meant for.

### Running (some) Parts Remotely
If you wish to run your tool **remotely** set `local_only` field to `false`. Also all `hostname` keys must be set correctly as well as `CLIP_query_to_vec` address. Use the public hostname of the server it will be reachable at.

### Running in Competition Setup
If you compete, make sure that `server_config` dictionar is correctly filled. Also make sure that `do_network_requests` is `true`, otherwise the network requests to the evaluation server will be imitated but not actually done.

## **Using SOMHunter**

If everything went well, your SOMHunter should be running. Just visit http://localhost:8080 and enjoy. These are of course default values, if you configured it differently, edit the address accordingly.

Also, Core API specification can be seen (by default) at https://localhost:8080/api/.

To see how to use the application itself, please see our user documentation inside [`somhunter-docs`](https://github.com/siret-junior/somhunter-docs).

## Licenses
### Our Sources
Please see the [LICENSE file](LICENSE). 

### Attached dataset
The attached dataset is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).

For more information, please see:
https://ftp.itec.aau.at/datasets/short-casual-videos/

### Models downloaded during the installation
During the installation, the script will download two third-party models. You will be prompted to accept this. You need to check that the way you're about to use them is OK with their respective licenses.

- ResNext101:
Mettes, P., Koelma, D. C., & Snoek, C. G. (2020). Shuffled ImageNet Banks for Video Event Detection and Search. ACM Transactions on Multimedia Computing, Communications, and Applications (TOMM), 16(2), 1-21.

- ResNet152: 
https://mxnet.incubator.apache.org/versions/1.9.0/
