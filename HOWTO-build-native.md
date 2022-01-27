## **Build & Run (for bold & brave)**
Alright, you decided to build SOMHunter in your environment. First make sure that you have all the prerequisites installed.

### Prerequisites
- Git
- Python3 (with `python` alias pointing to the python3 binary)
    - with `urllib3` lib installed
- Node.js & `npm`
- [Ember.js](https://guides.emberjs.com/release/getting-started/quick-start/)
- `libcurl`- [https://curl.se/libcurl/](https://curl.se/libcurl/)
- `OpenCV` - [https://opencv.org/](https://opencv.org/)
- `cpprestsdk` - [https://github.com/microsoft/cpprestsdk](https://github.com/microsoft/cpprestsdk)
- `libtorch`  - [https://pytorch.org/](https://pytorch.org/)
  - (this will be downloaded and installed during CMake script execution, you shouldn't worry about this)


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
