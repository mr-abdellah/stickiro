"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import {
  StickerData,
  convertToPixels,
  StickerDimensions,
} from "@/lib/sticker-utils";
import { PDFConfiguration } from "./PDFConfigControl";

interface PDFPreviewProps {
  config: PDFConfiguration;
  stickerDimensions: StickerDimensions;
  sampleSticker: StickerData;
}

export const PDFPreview = ({
  config,
  stickerDimensions,
  sampleSticker,
}: PDFPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawPreview = () => {
      // Get page dimensions
      const page =
        config.orientation === "landscape"
          ? { width: config.customHeight, height: config.customWidth }
          : { width: config.customWidth, height: config.customHeight };

      // Calculate layout
      const availableWidth =
        page.width - config.marginLeft - config.marginRight;
      const availableHeight =
        page.height - config.marginTop - config.marginBottom;

      const stickerWidthMM =
        stickerDimensions.sticker.width * 10 * config.stickerScale;
      const stickerHeightMM =
        stickerDimensions.sticker.height * 10 * config.stickerScale;

      const stickersPerRow = Math.max(
        1,
        Math.floor(
          (availableWidth + config.paddingHorizontal) /
            (stickerWidthMM + config.paddingHorizontal)
        )
      );
      const stickersPerCol = Math.max(
        1,
        Math.floor(
          (availableHeight + config.paddingVertical) /
            (stickerHeightMM + config.paddingVertical)
        )
      );

      // Set canvas size (scale down for display)
      const scale = Math.min(400 / page.width, 600 / page.height);
      canvas.width = page.width * scale;
      canvas.height = page.height * scale;

      // Clear canvas
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw page border
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // Draw margins (light gray area)
      ctx.fillStyle = "#F9FAFB";
      ctx.fillRect(0, 0, canvas.width, config.marginTop * scale);
      ctx.fillRect(
        0,
        canvas.height - config.marginBottom * scale,
        canvas.width,
        config.marginBottom * scale
      );
      ctx.fillRect(0, 0, config.marginLeft * scale, canvas.height);
      ctx.fillRect(
        canvas.width - config.marginRight * scale,
        0,
        config.marginRight * scale,
        canvas.height
      );

      // Draw printable area border
      const printX = config.marginLeft * scale;
      const printY = config.marginTop * scale;
      const printWidth = availableWidth * scale;
      const printHeight = availableHeight * scale;

      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(printX, printY, printWidth, printHeight);
      ctx.setLineDash([]);

      // Draw stickers grid
      for (let row = 0; row < stickersPerCol; row++) {
        for (let col = 0; col < stickersPerRow; col++) {
          const x =
            printX + col * (stickerWidthMM + config.paddingHorizontal) * scale;
          const y =
            printY + row * (stickerHeightMM + config.paddingVertical) * scale;
          const width = stickerWidthMM * scale;
          const height = stickerHeightMM * scale;

          // Draw sticker background
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(x, y, width, height);

          // Draw sticker border
          ctx.strokeStyle = "#6B7280";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, width, height);

          // Draw simplified sticker content
          const centerX = x + width / 2;
          const centerY = y + height / 2;

          // Logo placeholder
          const logoHeight = height * 0.3;
          ctx.fillStyle = "#E5E7EB";
          ctx.fillRect(
            centerX - width * 0.4,
            y + height * 0.1,
            width * 0.8,
            logoHeight
          );

          // QR code placeholder
          const qrSize = Math.min(width, height) * 0.25;
          ctx.fillStyle = "#000000";
          ctx.fillRect(
            centerX - qrSize / 2,
            centerY - qrSize / 2,
            qrSize,
            qrSize
          );

          // Contact text placeholder
          ctx.fillStyle = "#6B7280";
          const textY = y + height * 0.8;
          ctx.fillRect(
            centerX - width * 0.35,
            textY,
            width * 0.7,
            height * 0.05
          );
          ctx.fillRect(
            centerX - width * 0.3,
            textY + height * 0.07,
            width * 0.6,
            height * 0.04
          );
        }
      }

      // Draw labels
      ctx.fillStyle = "#374151";
      ctx.font = "12px Arial";
      ctx.textAlign = "start";

      // Margin labels
      ctx.fillText(`${config.marginTop}mm`, 5, config.marginTop * scale - 5);
      ctx.fillText(`${config.marginLeft}mm`, 5, 15);

      // Grid info
      ctx.font = "10px Arial";
      ctx.fillText(
        `${stickersPerRow}×${stickersPerCol} grid`,
        printX + 5,
        printY + 15
      );
      ctx.fillText(
        `${stickersPerRow * stickersPerCol} stickers/page`,
        printX + 5,
        printY + 30
      );
    };

    drawPreview();
  }, [config, stickerDimensions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          PDF Page Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <canvas
          ref={canvasRef}
          className="border rounded-lg shadow-sm"
          style={{ maxWidth: "100%", height: "auto" }}
        />

        <div className="text-sm text-muted-foreground text-center space-y-1">
          <p>
            <strong>Preview Scale:</strong> Actual size will be{" "}
            {config.customWidth}×{config.customHeight}mm
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 border"></div>
              <span>Margins</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border border-dashed border-blue-500"></div>
              <span>Print Area</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-white border border-gray-400"></div>
              <span>Stickers</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
