/**
 * This will be displayed as a moudle.
 * @module
 */
const sharp = require("sharp");
const path = require("path");

// Make sure that this points to your public folder
const publicFolder = path.resolve(__dirname, "..", "public")

// This function creates configuration objects for the webpack-copy-plugin
function generatePatterns(widths) {
  return widths.map((width) => ({
    context: "public/",
    // In this case we are processing .jpg and .png images inside our public folder
    // You can extend this config for other formats adding them inside the *.{jpg,png}
    from: path.resolve(publicFolder, "./**/*.{jpg,png}").replace(/\\/g, "/"),
    // This is the folder where we want our processed images
    to: path.resolve(publicFolder, "optimized", `[path][name]_w${width}[ext]`),
    // We don't want to process already processed images
    globOptions: { ignore: "**/optimized/**" },
    // This is the function that actually does the processing
    // If you want to use an alternative from sharp you can do it here!
    transform: (content) => sharp(content).resize(width).jpeg({ mozjpeg: true }).toBuffer(),
  }));
}

module.exports = generatePatterns;
