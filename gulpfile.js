
const { series } = require("gulp");
const fs = require("fs");
const path = require("path")
const http = require('http');

const config = require("./config.json");

// >>> Change this <<<
const thumbs_scr_dir = path.join(__dirname, config.ui_dir, "/public/thumbs/");
const thumbs_scr_dir2 = path.join(__dirname, config.ui_dir, "/build/thumbs/");
const frames_scr_dir = path.join(__dirname, config.ui_dir, "./public/frames/");
const frames_scr_dir2 = path.join(__dirname, config.ui_dir, "/build/frames/");

const thumbs_dest_dir = config.thumbs_dir;
const frames_dest_dir = config.frames_dir;

const ResNet_URL = config.model_ResNet_URL;
const ResNext_URL = config.model_ResNext_URL;

const models_dir = path.join(__dirname, config.models_dir);


function download(url, dest, cb) {

  var file = fs.createWriteStream(dest);

  http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
      console.log(`File ${url} downloaded.`)
    });
  });
}

async function fetchModels(cb) {
  if (!fs.existsSync(models_dir)){
    fs.mkdirSync(models_dir, { recursive: true }, (err) => {
      if (err) throw err;
    });
  }
 
  const m1 = path.join(models_dir, "/traced_Resnet152.pt");
  const m2 = path.join(models_dir, "/traced_Resnext101.pt");

  if (!fs.existsSync(m2)){
    console.log(`Downloading model: ${ResNet_URL}`);
    await download(ResNet_URL, m1);
 
  } else {
    console.log(`Model ${m1} found!`);
  }

  if (!fs.existsSync(m2)){
    console.log(`Downloading model: ${ResNext_URL}`);
    await download(ResNext_URL, m2);
  } else {
    console.log(`Model ${m2} found!`);
  }

  cb();
}

function cleanSymlinks(cb) {
  console.log("Deleting existing symlinks in the `ui` directory...")
  fs.rmdirSync("./ui/public/thumbs/", {recursive: true});
  fs.rmdirSync("./ui/public/frames/", {recursive: true});
  fs.rmdirSync("./ui/build/thumbs/", {recursive: true});
  fs.rmdirSync("./ui/build/frames/", {recursive: true});

  cb();
}


function createSymlinks(cb) {
  console.log("Creating frames/thumbs symlinks from the `ui`...")

  fs.symlink(path.join(__dirname, thumbs_dest_dir), thumbs_scr_dir, "junction", () => {});
  fs.symlink(path.join(__dirname, thumbs_dest_dir), thumbs_scr_dir2, "junction", () => {});

  fs.symlink(path.join(__dirname, frames_dest_dir), frames_scr_dir, "junction", () => {});
  fs.symlink(path.join(__dirname, frames_dest_dir), frames_scr_dir2, "junction", () => {});
  cb();
}

function preinstall(cb) {
  cb();
}

function clean(cb) {
  console.log("Deleting  all...")

  if (!fs.existsSync("./build/")){
    fs.rmSync("./build/", { recursive: true, force: true });
  }

  if (!fs.existsSync(path.join(config.ui_dir, "./build/"))){
    fs.rmSync(path.join(config.ui_dir, "./build/"), { recursive: true, force: true });
  }
  cb();
}

exports.clean = clean;
exports.cleanSymlinks = cleanSymlinks;
exports.createSymlinks = createSymlinks;
exports.preinstall = preinstall;
exports.postinstall = series(fetchModels, cleanSymlinks, createSymlinks);



// var child_process = require('child_process');
// var fs = require('fs');
// var path = require('path');
// var safe = 0;

// let args = process.argv.splice(2).toString().replace(/,/g ,' ');
// function recurse(_path){
// safe ++;
// if(safe > 5000){
//   console.log('directory may be too large')
//   return
// }

//   if(/node_modules$/.test(_path)){
//     let cwd = path.resolve(__dirname ,_path)
//     console.log('found node_modules at '+cwd)
//     child_process.exec(`start cmd.exe /k npm ${args}`,{cwd})

//     return
//   }
//   let directoryList = fs.readdirSync(_path);
//     directoryList.forEach(function(nextDir){
//     if(fs.statSync(_path+'/'+nextDir).isFile()){
//       return

//     }
//     if(/^\./.test(nextDir)){ //.folder beginging with .
//       return
//     }
//     recurse(_path+'/'+nextDir);

//   })
// }
// recurse('./' )