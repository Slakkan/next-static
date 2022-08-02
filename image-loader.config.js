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
