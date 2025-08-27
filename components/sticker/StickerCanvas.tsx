"use client";

import { useEffect, useRef } from "react";
import {
  StickerData,
  generateQRCode,
  convertToPixels,
  StickerDimensions,
} from "@/lib/sticker-utils";

interface StickerCanvasProps {
  data: StickerData;
  dimensions: StickerDimensions;
  className?: string;
}

export const StickerCanvas = ({
  data,
  dimensions,
  className = "",
}: StickerCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixelDimensions = convertToPixels(dimensions);

    // Update canvas size
    canvas.width = pixelDimensions.sticker.width;
    canvas.height = pixelDimensions.sticker.height;

    const drawSticker = async () => {
      // Clear canvas with white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add border
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // Calculate positions based on dimensions
      let currentY = pixelDimensions.spacing.top;

      // Logo section
      const logoX = (canvas.width - pixelDimensions.logo.width) / 2;
      const logoY = currentY;

      if (data.logo) {
        const logoImg = new Image();
        logoImg.onload = () => {
          ctx.drawImage(
            logoImg,
            logoX,
            logoY,
            pixelDimensions.logo.width,
            pixelDimensions.logo.height
          );
        };
        logoImg.src = data.logo;
      } else {
        // Logo placeholder
        ctx.fillStyle = "#F3F4F6";
        ctx.fillRect(
          logoX,
          logoY,
          pixelDimensions.logo.width,
          pixelDimensions.logo.height
        );

        ctx.fillStyle = "#9CA3AF";
        ctx.font = `${Math.min(pixelDimensions.logo.width / 8, 32)}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(
          "LOGO",
          logoX + pixelDimensions.logo.width / 2,
          logoY + pixelDimensions.logo.height / 2 + 8
        );
      }

      // Update Y position for QR section
      currentY += pixelDimensions.logo.height + pixelDimensions.spacing.middle;

      // QR Code section
      const qrX = (canvas.width - pixelDimensions.qr.width) / 2;
      const qrY = currentY;

      try {
        const qrCodeDataUrl = await generateQRCode(
          data.qrData || data.website || data.phone,
          pixelDimensions.qr.width
        );
        const qrImg = new Image();
        qrImg.onload = () => {
          ctx.drawImage(
            qrImg,
            qrX,
            qrY,
            pixelDimensions.qr.width,
            pixelDimensions.qr.height
          );
        };
        qrImg.src = qrCodeDataUrl;
      } catch (error) {
        console.error("Error generating QR code:", error);
        // QR placeholder
        ctx.fillStyle = "#F3F4F6";
        ctx.fillRect(
          qrX,
          qrY,
          pixelDimensions.qr.width,
          pixelDimensions.qr.height
        );
        ctx.strokeStyle = "#9CA3AF";
        ctx.strokeRect(
          qrX,
          qrY,
          pixelDimensions.qr.width,
          pixelDimensions.qr.height
        );
      }

      // Update Y position for contact section
      currentY += pixelDimensions.qr.height + pixelDimensions.spacing.bottom;

      // Contact information section
      const contactX = (canvas.width - pixelDimensions.contact.width) / 2;
      const contactY = currentY;

      // Calculate font sizes based on contact area height
      const baseFontSize = Math.min(pixelDimensions.contact.height / 3, 28);

      // Phone number
      ctx.fillStyle = "#1F2937";
      ctx.font = `bold ${baseFontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(
        data.phone,
        contactX + pixelDimensions.contact.width / 2,
        contactY + baseFontSize
      );

      // Email
      ctx.font = `${baseFontSize * 0.8}px Arial`;
      ctx.fillText(
        data.email,
        contactX + pixelDimensions.contact.width / 2,
        contactY + baseFontSize * 2.2
      );

      // Website (if space allows and website exists)
      if (data.website && pixelDimensions.contact.height > baseFontSize * 2.5) {
        ctx.font = `${baseFontSize * 0.7}px Arial`;
        ctx.fillStyle = "#6B7280";
        ctx.fillText(
          data.website,
          contactX + pixelDimensions.contact.width / 2,
          contactY + baseFontSize * 3.2
        );
      }

      // REMOVED: Number display section - no more green #10000 text

      // Draw section boundaries (for debugging - remove in production)
      if (process.env.NODE_ENV === "development") {
        ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(
          logoX,
          logoY,
          pixelDimensions.logo.width,
          pixelDimensions.logo.height
        );
        ctx.strokeRect(
          qrX,
          qrY,
          pixelDimensions.qr.width,
          pixelDimensions.qr.height
        );
        ctx.strokeRect(
          contactX,
          contactY,
          pixelDimensions.contact.width,
          pixelDimensions.contact.height
        );
      }
    };

    drawSticker();
  }, [data, dimensions]);

  const pixelDimensions = convertToPixels(dimensions);

  return (
    <canvas
      ref={canvasRef}
      width={pixelDimensions.sticker.width}
      height={pixelDimensions.sticker.height}
      className={`border rounded-lg ${className}`}
      style={{
        maxWidth: "300px",
        maxHeight: "300px",
        width: "auto",
        height: "auto",
      }}
    />
  );
};
