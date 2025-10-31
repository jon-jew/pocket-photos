import QRCode from 'qrcode';
import imageCompression from 'browser-image-compression';

declare global {
  interface UploadedImage {
    file: File;
    previewUrl: string;
  }
};

export const getAlbumHoursRemaining = (nowTimestamp: number, timestamp: number): number =>
  42 - Math.floor((nowTimestamp - timestamp) / (1000 * 60 * 60));

export const getAlbumDaysRemaining =
  (nowTimestamp: number, timestamp: number): number => 7 - Math.floor((nowTimestamp - timestamp) / (1000 * 60 * 60 * 24));

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

export const compressFile = async (file: File, fullQuality: boolean): Promise<NewImageEntry> => {
  const options = {
    maxSizeMB: fullQuality ? 8 : 2,
    maxWidthOrHeight: fullQuality ? 3200 : 2000,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return ({
      file: compressedFile,
      imageUrl: URL.createObjectURL(compressedFile),
    });
  } catch (error) {
    console.error(error);
    return ({
      file: file,
      imageUrl: URL.createObjectURL(file),
    })
  }
};

export const getTimeDifference = (pastDate: number, isAbbreviated: boolean) => {
  const now = new Date().getTime();
  const past = new Date(pastDate).getTime();

  // Calculate difference in milliseconds
  const diffMs = now - past;

  // Convert to minutes, hours, and days
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Return appropriate format
  if (isAbbreviated) {
    if (diffMinutes < 60) {
      return `${diffMinutes} m ago`;
    } else if (diffHours < 24) {
      return `${diffHours} h ago`;
    } else {
      return `${diffDays} d ago`;
    }
  } else {
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
  }
}