const fs = require("fs");
const { join } = require("path");
const axios = require("axios");
const blend = require("@mapbox/blend");

const {
  greeting = "Hello",
  who = "You",
  width = 400,
  height = 500,
  color = "Pink",
  size = 100,
  file = "cat-card.jpg",
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
        blend(
          [
            {
              buffer: res1.data,
              x: 0,
              y: 0,
            },
            {
              buffer: res2.data,
              x: width,
              y: 0,
            },
          ],
          {
            width: width * 2,
            height: height,
            format: "jpeg",
          },
          async (err, data) => {
            try {
              const fileOut = join(process.cwd(), "/images/");
              makeFolderExists(fileOut);
              await fs.promises.writeFile(fileOut + file, data);
              console.log("The file was saved!");
              console.timeEnd("Image blending");
            } catch (err) {
              console.log(err);
            }
          }
        );
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

blendImages();
