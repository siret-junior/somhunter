
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

exports.cleanSymlinks = cleanSymlinks;
exports.preinstall = series(fetchModels);
exports.postinstall = series(cleanSymlinks, createSymlinks);