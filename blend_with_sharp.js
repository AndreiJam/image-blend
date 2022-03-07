const fs = require("fs");
const { join } = require("path");
const axios = require("axios");
const sharp = require("sharp");

const {
  greeting = "Hello",
  who = "You",
  width = 400,
  height = 500,
  color = "Pink",
  size = 100,
} = require("minimist")(process.argv.slice(2));

const apiPath = "cat/says/";
const myUrlWithParams = new URL("https://cataas.com");
myUrlWithParams.searchParams.append("width", width);
myUrlWithParams.searchParams.append("height", height);
myUrlWithParams.searchParams.append("color", color);
myUrlWithParams.searchParams.append("s", size);
myUrlWithParams.pathname = apiPath + greeting;
const firstReq = myUrlWithParams.toString();
myUrlWithParams.pathname = apiPath + who;
const secondReq = myUrlWithParams.toString();

const myAxios = axios.create({
  responseType: "arraybuffer",
});

async function blendImages() {
  try {
    console.time("Image 1");
    const res1 = await myAxios.get(firstReq);
    console.timeEnd("Image 1");
    if (res1.status === 200) {
      console.time("Image 2");
      const res2 = await myAxios.get(secondReq);
      console.timeEnd("Image 2");
      if (res2.status === 200) {
        console.time("Image blending");
        await sharp(res1.data)
          .resize(2 * width, height, {
            kernel: sharp.kernel.nearest,
            fit: "contain",
            position: "left top",
            background: { r: 255, g: 255, b: 255, alpha: 0.5 },
          })
          .composite([{ input: res2.data, left: width, top: 0 }])
          .toFile("images/cat-card-sharp.jpg");
        console.timeEnd("Image blending");
      }
    }
  } catch (err) {
    console.log(err);
  }
}

function makeFolderExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}
makeFolderExists(join(process.cwd(), "/images"));
blendImages();
