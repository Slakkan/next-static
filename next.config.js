/** @type {import('next').NextConfig} */
const { withImageLoader } = require("next-image-loader");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const generatePatterns = require("./utilities/webpack.utils");

// These are the default breakpoints Nextjs uses, you can change them if you like
const deviceSizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
const imageSizes = [16, 32, 48, 64, 96, 128, 256, 384];

// Wrap your config object with withImageLoader function
module.exports = withImageLoader({
  // This configures the <Image /> component to use our custom loader
  images: {
    loader: "custom",
    deviceSizes,
    imageSizes,
  },
  // Here we can extend the default webpack configuration
  webpack: (config, { dev }) => {
    // We check that the environment is not dev.
    // Nextjs local dev server will process the images for us.
    if (!dev) {
      // We add the copy plugin to the webpack plugins array
      // The generatePatterns function returns a configuration object (explained later)
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: generatePatterns([...deviceSizes, ...imageSizes]),
        })
      );
    }
    return config;
  },
});
