export const CM_TO_PIXELS = 118.11; // 300 DPI conversion factor

export interface StickerDimensions {
  sticker: { width: number; height: number };
  logo: { width: number; height: number };
  qr: { width: number; height: number };
  contact: { width: number; height: number };
  spacing: { top: number; middle: number; bottom: number };
}

export const DEFAULT_DIMENSIONS: StickerDimensions = {
  sticker: { width: 5, height: 8 },
  logo: { width: 3.8, height: 2.6 },
  qr: { width: 3.1, height: 3.1 },
  contact: { width: 3.8, height: 1.0 },
  spacing: { top: 0.3, middle: 0.3, bottom: 0.3 },
};

export const convertToPixels = (dimensions: StickerDimensions) => ({
  sticker: {
    width: dimensions.sticker.width * CM_TO_PIXELS,
    height: dimensions.sticker.height * CM_TO_PIXELS,
  },
  logo: {
    width: dimensions.logo.width * CM_TO_PIXELS,
    height: dimensions.logo.height * CM_TO_PIXELS,
  },
  qr: {
    width: dimensions.qr.width * CM_TO_PIXELS,
    height: dimensions.qr.height * CM_TO_PIXELS,
  },
  contact: {
    width: dimensions.contact.width * CM_TO_PIXELS,
    height: dimensions.contact.height * CM_TO_PIXELS,
  },
  spacing: {
    top: dimensions.spacing.top * CM_TO_PIXELS,
    middle: dimensions.spacing.middle * CM_TO_PIXELS,
    bottom: dimensions.spacing.bottom * CM_TO_PIXELS,
  },
});

export interface StickerData {
  id: string;
  name: string;
  phone: string;
  email: string;
  website?: string;
  qrData: string;
  logo?: string;
  number?: number;
  formattedNumber?: string;
}

export const generateQRCode = async (
  data: string,
  size: number
): Promise<string> => {
  const QRCode = await import("qrcode");
  return QRCode.toDataURL(data, {
    width: size,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
};
