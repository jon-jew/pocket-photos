import QRCode from 'qrcode';

export const generateQR = async (text: string)  => {
  try {
    const qrImg = await QRCode.toDataURL(text);
    return qrImg;
  } catch (err) {
    console.error(err)
  }
}