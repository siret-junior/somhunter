{
    "variables": {
        "LIBTORCH_URL_PREBUILT_UNIX": "https://download.pytorch.org/libtorch/cpu/libtorch-cxx11-abi-shared-with-deps-1.7.1%2Bcpu.zip",
        "LIBTORCH_URL_PREBUILT_UNIX_CUDA": "",
        "LIBTORCH_URL_PREBUILT_WIN": "",
        "LIBTORCH_URL_PREBUILT_WIN_CUDA": "",
    },
    "targets": [
        {
            "target_name": "somhunter_core",
            
            "sources": [
                "main.cpp",
                "SomHunterNapi.cpp",
                "somhunter-core/3rdparty/json11/json11.cpp",
                "somhunter-core/src/SomHunter.cpp",
                "somhunter-core/src/SOM.cpp",
                "somhunter-core/src/AsyncSom.cpp",
                "somhunter-core/src/DatasetFeatures.cpp",
                "somhunter-core/src/DatasetFrames.cpp",
                "somhunter-core/src/KeywordRanker.cpp",
                "somhunter-core/src/RelevanceScores.cpp",
                "somhunter-core/src/Submitter.cpp",
                "somhunter-core/src/UserContext.cpp",
                "somhunter-core/src/SearchContext.cpp",
                "somhunter-core/src/Filters.cpp",
                "somhunter-core/src/ImageManipulator.cpp",
                "somhunter-core/src/CollageRanker.cpp",
            ],
            "include_dirs": [
                "<!@(node -p \"require('node-addon-api').include\")",
                "somhunter-core/src/",
                "somhunter-core/3rdparty/json11/",
                "somhunter-core/3rdparty/stb/",
                "somhunter-core/3rdparty/cereal/include/",
                "somhunter-core/3rdparty/libtorch/include/torch/csrc/api/include",
                "somhunter-core/3rdparty/libtorch/include/",
            ],
            "libraries": [],
            "dependencies": [
                "<!(node -p \"require('node-addon-api').gyp\")"
            ],
            "defines": [
                "NAPI_CPP_EXCEPTIONS",
                "HAS_NAPI_HEADERS",
                "_SILENCE_ALL_CXX17_DEPRECATION_WARNINGS"
            ],
            "cflags_cc": [
                "-std=c++17","-fexceptions", "-march=native", "-frtti", "-D_GLIBCXX_USE_CXX11_ABI=1"
            ],
            "msvs_settings": {
                "VCCLCompilerTool": {
                    "AdditionalOptions": [
                        "-std:c++17",
                        "/MP /EHsc /Qspectre",
                        "/GR",
                        "/experimental:external /external:anglebrackets /external:W0"
                                
                    ]
                } 
            },
            "conditions": [
                [
                    "OS=='linux'",
                    {
                        'actions': [
                            {
                                'action_name': 'Install libTorch',
                                'inputs': [ 
                                    "somhunter-core/scripts/install_libtorch.sh" 
                                ],
                                'outputs': [
                                    '<(INTERMEDIATE_DIR)/some_output',
                                ],
                                'action': ['sh',  'somhunter-core/scripts/install_libtorch.sh', '<(LIBTORCH_URL_PREBUILT_UNIX)', '<!(pwd)/somhunter-core/3rdparty/'],
                            },
                        ],
                        "include_dirs":[
                            "<!@(pkg-config libcurl --cflags-only-I | sed s/-I//g)"
                        ],
                        "link_settings": {
                            "libraries": [
                                "-L/usr/lib64/",
                                "-L <!(pwd)/somhunter-core/3rdparty/libtorch/lib",
                                "-lstdc++fs",
                                "-lc10", "-ltorch", "-ltorch_cpu",
                                "<!@(pkg-config libcurl --libs)"
                            ]
                        }
                    }
                ],
                [
                    "OS=='win'",
                    {
                        'actions': [
                            {
                                'action_name': 'Install libTorch',
                                'inputs': [ 
                                    "somhunter-core/scripts/install_libtorch.ps1" 
                                ],
                                'outputs': [
                                    '<(INTERMEDIATE_DIR)/some_output',
                                ],
                                'action': ['powershell -ExecutionPolicy Bypass -File "<(RULE_INPUT_PATH)" "https://download.pytorch.org/libtorch/cpu/libtorch-win-shared-with-deps-1.7.1%2Bcpu.zip" <(RULE_INPUT_DIRNAME)\\..\\3rdparty\\'],
                            },
                        ],
                        "include_dirs":[
                            "<!(echo %cd%)\\somhunter-core\\3rdparty\libcurl\\win\\curl\\include\\",
                        ],
                        "link_settings": {
                            "libraries": [
                                "libcurl.lib",
                                "zlib.lib",
                                "torch.lib",
                                "c10.lib",
                                "torch_cpu.lib"
                            ]
                        },
                        "copies": [
                            {
                                "destination": "<(PRODUCT_DIR)",
                                "files": [ 
                                    "<!(echo %cd%)\\somhunter-core\\3rdparty\libcurl\\win\\curl\\bin\\libcurl.dll", 
                                    "<!(echo %cd%)\\somhunter-core\\3rdparty\libcurl\\win\\curl\\bin\\zlib1.dll",
                                    "<!(echo %cd%)\\somhunter-core\\3rdparty\\libtorch\\lib\\torch.dll",
                                    "<!(echo %cd%)\\somhunter-core\\3rdparty\\libtorch\\lib\\c10.dll",
                                    "<!(echo %cd%)\\somhunter-core\\3rdparty\\libtorch\\lib\\torch_cpu.dll",
                                    "<!(echo %cd%)\\somhunter-core\\3rdparty\\libtorch\\lib\\asmjit.dll",
                                    "<!(echo %cd%)\\somhunter-core\\3rdparty\\libtorch\\lib\\uv.dll",
                                    "<!(echo %cd%)\\somhunter-core\\3rdparty\\libtorch\\lib\\libiompstubs5md.dll",
                                    "<!(echo %cd%)\\somhunter-core\\3rdparty\\libtorch\\lib\\libiomp5md.dll",
                                    "<!(echo %cd%)\\somhunter-core\\3rdparty\\libtorch\\lib\\fbgemm.dll",
                                ]
                            }
                        ],
                        "msvs_settings": {
                            "VCCLCompilerTool": {
                                "AdditionalOptions": [                                ]
                            },
                            "VCLinkerTool": {
                                "AdditionalLibraryDirectories": [
                                    "<!(echo %cd%)\\somhunter-core\\3rdparty\libcurl\\win\\curl\\lib\\",
                                    "<!(echo %cd%)\\somhunter-core\\3rdparty\\libtorch\\lib\\",
                                ]
                            }
                        }
                    }
                ]
            ]
        }
    ]
}
