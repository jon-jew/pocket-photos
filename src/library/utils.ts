import QRCode from 'qrcode';
import imageCompression from 'browser-image-compression';

declare global {
  interface UploadedImage {
    file: File;
    previewUrl: string;
  }
};

export const generateQR = async (text: string) => {
  try {
    const qrImg = await QRCode.toDataURL(text);
    return qrImg;
  } catch (err) {
    console.error(err)
  }
}

export const compressFile = async (file: File): Promise<UploadedImage> => {
  const options = {
    maxSizeMB: 0.75,
    maxWidthOrHeight: 1500,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return ({
      file: compressedFile,
      previewUrl: URL.createObjectURL(compressedFile),
    });
  } catch (error) {
    console.error(error);
    return ({
      file: file,
      previewUrl: URL.createObjectURL(file),
    })
  }
};