# Deploying static Nextjs apps into Azure
This post will guide you through the steps to setup a static export of your Nextjs app. But before we get started let’s list some of the reasons why you might want to use Next for a static webapp instead of plain react:

-	SEO out of the box, no configuration or extra code required
-	Image optimization, Nextjs will serve lighter versions of your images to smaller screen sizes
-	Easier to setup and maintain project. Next will configure common dependencies most projects need: webpack, es-lint, css-modules, typescript, sass etc. 
-	Gives your project a standardized structure. This one often gets un-noticed but is very convenient for onboarding new developers.

## Setup of the project
If you already have a Nextjs project you can skip this step.

```sh
npx create-next-app --ts 
```

```sh
npm install sass
```

Go to package.json and change the build script to:

```json
"build": "next build && next export",
```
Done. Very easy, bearly an inconvenience.
<br>
# Image Optimization
If you go to the [Nextjs Documentation](https://nextjs.org/docs/advanced-features/static-html-export) you will see that the Image Optimization does not work with the static exports. 

Let's fix that!

First we need an image processing library
```sh
npm install -D sharp
```

Then we need to tell Next where to find our processed images

For this we need a custom image loader
```sh
npm install next-image-loader
```

And finally the copy plugin from webpack to use sharp in our build process
```sh
npm install -D copy-webpack-plugin
```

Now let's configure our app to use these dependencies:

Go to next.config.js

**next.config.js**
```js
/** @type {import('next').NextConfig} */
const withImageLoader = require("next-image-loader");
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
```

Let's create an utility function to configure the webpack-copy-plugin

Create a file on /utilities called webpack.utils.js

**utilities/webpack.utils.js**
```js
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
```

And finally we configure the next-image-loader

Create a file on the root of the project called image-loader.config.js

**image-loader.config.js**
```js
import { imageLoader } from "next-image-loader/build/image-loader";

imageLoader.loader = ({ src, width, quality }) => {
    // Note that we are assuming there is only one "." in the name of the file
    // if you need to process files with "." in their name you need to change this logic
    const [path, extension] = encodeURIComponent(src).replace(/%2F/gi, "/").split(".");

    if (process.env.NODE_ENV === "development") {
        return `${path}.${extension}`;
    }

    // we don't optimized svg as there is really no need to, they are scalable ;)
    return extension === "svg" ? `${path}.${extension}` : `/optimized${path}_w${width}.${extension}`;
};

```

Now if we run our build we will see that new files are generated on the public/optimized folder

```sh
npm run build
```

We should not commit these files as they are generated so let's add them to our .gitignore in the "next.js" category since these files are generated by our build process
```
# next.js
/.next/
/out/
/public/optimized
```

And we are done with this section. 

To develop you can use the dev command to get all those juicy developer quality of life features like error mapping, hot reloading, etc.

```sh
npm run dev
```


But if you want to test weather the static export works you are going to need to serve the actual build. For this I'm using http-server as follows:


First install http-server
```sh
npm i -g http-server
```

then we run our build command, 
```sh
npm run build
```
And then we serve the out folder with http-server
```sh
http-server out
```

With the default config, your page should be served at: http://127.0.0.1:8080

