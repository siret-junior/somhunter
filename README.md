# SOMHunter

# Extracting the data from the videos

# Building the SOMHunter
Please start with 
```
git clone --recurse-submodules https://github.com/FrankMejzlik/SOMHunter !! EDIT THIS
```
## Prerequisites
- Node.js
- Python 3

## Getting the dependencies
cURL library is required dependency for building the SOMHunter core.

### Unix systems
Use your system package manager to download and install the `libcurl` library. When you proceed to installation  the `pkg-config` will try to find the `libcurl` in your system. 

In case of any problems you can manually configure the build configuration file at `cppsrc/SomHunterWrapper/binding.gyp`.

### Windows
For the Windows, include library for the `libcurl` is set to `c:\Program Files\curl\include\` and the compiled library directory to `c:\Program Files\curl\include\lib\`. You can install headers and the library there manually of course, but the recommended solution is to use the [vcpkg](https://docs.microsoft.com/en-us/cpp/build/vcpkg?view=vs-2019) package system. 

After you install the vcpkg just download the library and export. After that you just place it into the program files directory above.

This is an exapmple for 64-bit version of the library. **vcpkg** also handles all the dependencies and bundles them into the exported directory as well.
```
:: Install the package
vcpkg install curl:x64-windows

:: Do the export
vcpkg export --raw curl:x64-windows
```

Now you just copy the exported directory to the `c:\Program Files\`.

In case of any problems you can manually configure the build configuration file at `cppsrc/SomHunterWrapper/binding.gyp` and configure the include and library paths as you wish.

## Bulding & running
After resolving the dependencies, you just build and run the application.

```
npm install
npm run start
```

The `npm install` also triggers the `npm run build` command that will compile the native core library. If you have all the dependencies set correctly, this should finish without any errors. If any errors occur, pleese follow the presented errors and try to resolve them. 

If you need to edit some compile options, please head to the `cppsrc/SomHunterWrapper/binding.gyp` file that is config file for the node-gyp build system.

## Data
Please use included data extractor placed in the `extractor/` directory. You can also use pre-extracted data for the V3C1 dataset [HERE]().

Then set up paths to those files inside the `config.json` file. The application will take this config file (placed in the root of the project) and load the files at the provided locations.

Also the extracted frames (e.g. JPEG files) must be placed in the `public/thumbs/` directory so the browser can access them. The symlink to their original directory will suffice.