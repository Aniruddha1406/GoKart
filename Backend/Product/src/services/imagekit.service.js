import Imagekit from "@imagekit/nodejs";

const imagekitservice = new Imagekit({
    privateKey: "private_dNGcZHVSVxfr2vcjOEP+3stks8U="
});

async function uploadImage(buffer) {
        const result = await imagekitservice.files.upload({
        file: buffer.toString("base64"),
        fileName: "image.jpg",
    });
    return result.url;
}

export default uploadImage;