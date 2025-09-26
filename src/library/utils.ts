import QRCode from 'qrcode';
import imageCompression from 'browser-image-compression';

declare global {
  interface UploadedImage {
    file: File;
    previewUrl: string;
  }
};

export async function streamToObject(readableStream: ReadableStream<Uint8Array>): Promise<object> {
  const reader = readableStream.getReader();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break; // Exit the loop when the stream is finished
    }

    // Decode the Uint8Array chunk to a string
    result += new TextDecoder().decode(value);
  }

  // Parse the accumulated string into a JavaScript object (e.g., JSON)
  try {
    return JSON.parse(result);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw error;
  }
}

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
    maxWidthOrHeight: 1200,
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