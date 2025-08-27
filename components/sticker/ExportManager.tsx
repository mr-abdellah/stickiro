"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  FileImage,
  FileText,
  StopCircle,
  Play,
  Pause,
} from "lucide-react";
import {
  StickerData,
  generateQRCode,
  convertToPixels,
  StickerDimensions,
} from "@/lib/sticker-utils";

interface ExportManagerProps {
  data: StickerData[];
  dimensions: StickerDimensions;
}

export const ExportManager = ({ data, dimensions }: ExportManagerProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [batchSize, setBatchSize] = useState(100);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [exportStatus, setExportStatus] = useState("");

  const cancelExport = useRef(false);

  const generateStickerImage = async (
    stickerData: StickerData
  ): Promise<string> => {
    return new Promise((resolve) => {
      const pixelDimensions = convertToPixels(dimensions);

      const canvas = document.createElement("canvas");
      canvas.width = pixelDimensions.sticker.width;
      canvas.height = pixelDimensions.sticker.height;

      const ctx = canvas.getContext("2d")!;

      const drawSticker = async () => {
        // Clear canvas with white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw border
        ctx.strokeStyle = "#E5E7EB";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        let imagesLoaded = 0;
        const totalImages = 2; // logo + QR

        const checkComplete = () => {
          imagesLoaded++;
          if (imagesLoaded >= totalImages) {
            // Calculate positions based on custom dimensions
            let currentY = pixelDimensions.spacing.top;

            // Skip to contact section
            currentY +=
              pixelDimensions.logo.height + pixelDimensions.spacing.middle;
            currentY +=
              pixelDimensions.qr.height + pixelDimensions.spacing.bottom;

            // Draw contact information
            const contactX = (canvas.width - pixelDimensions.contact.width) / 2;
            const contactY = currentY;

            // Calculate font sizes based on contact area height
            const baseFontSize = Math.min(
              pixelDimensions.contact.height / 3,
              32
            );

            // Phone number
            ctx.fillStyle = "#1F2937";
            ctx.font = `bold ${baseFontSize}px Arial`;
            ctx.textAlign = "center";
            ctx.fillText(
              stickerData.phone,
              contactX + pixelDimensions.contact.width / 2,
              contactY + baseFontSize
            );

            // Email
            ctx.font = `${baseFontSize * 0.8}px Arial`;
            ctx.fillText(
              stickerData.email,
              contactX + pixelDimensions.contact.width / 2,
              contactY + baseFontSize * 2.2
            );

            // Website (if space allows and website exists)
            if (
              stickerData.website &&
              pixelDimensions.contact.height > baseFontSize * 2.5
            ) {
              ctx.font = `${baseFontSize * 0.7}px Arial`;
              ctx.fillStyle = "#6B7280";
              ctx.fillText(
                stickerData.website,
                contactX + pixelDimensions.contact.width / 2,
                contactY + baseFontSize * 3.2
              );
            }

            // Display number if available
            // if (stickerData.number !== undefined) {
            //   const numberY =
            //     contactY +
            //     (stickerData.website &&
            //     pixelDimensions.contact.height > baseFontSize * 2.5
            //       ? baseFontSize * 4.2
            //       : baseFontSize * 3.5);

            //   // Check if there's space for the number
            //   if (numberY < pixelDimensions.sticker.height - 20) {
            //     ctx.font = `bold ${baseFontSize * 0.9}px Arial`;
            //     ctx.fillStyle = "#059669"; // Green color for numbers
            //     ctx.textAlign = "center";
            //     ctx.fillText(
            //       `#${stickerData.formattedNumber || stickerData.number}`,
            //       contactX + pixelDimensions.contact.width / 2,
            //       numberY
            //     );
            //   }
            // }

            resolve(canvas.toDataURL("image/png"));
          }
        };

        // Calculate positions
        let currentY = pixelDimensions.spacing.top;

        // Draw logo
        const logoY = currentY;
        const logoX = (canvas.width - pixelDimensions.logo.width) / 2;

        if (stickerData.logo) {
          const logoImg = new Image();
          logoImg.onload = () => {
            ctx.drawImage(
              logoImg,
              logoX,
              logoY,
              pixelDimensions.logo.width,
              pixelDimensions.logo.height
            );
            checkComplete();
          };
          logoImg.src = stickerData.logo;
        } else {
          // Draw placeholder
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
            logoY + pixelDimensions.logo.height / 2 + 12
          );
          checkComplete();
        }

        // Update Y position for QR section
        currentY +=
          pixelDimensions.logo.height + pixelDimensions.spacing.middle;

        // Draw QR code
        const qrY = currentY;
        const qrX = (canvas.width - pixelDimensions.qr.width) / 2;

        try {
          const qrCodeDataUrl = await generateQRCode(
            stickerData.qrData ||
              stickerData.number?.toString() ||
              stickerData.website ||
              stickerData.phone,
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
            checkComplete();
          };
          qrImg.src = qrCodeDataUrl;
        } catch (error) {
          console.error("QR generation error:", error);
          // Draw QR placeholder
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
          checkComplete();
        }
      };

      drawSticker();
    });
  };

  const stopExport = () => {
    cancelExport.current = true;
    setIsExporting(false);
    setExportProgress(0);
    setCurrentBatch(0);
    setExportStatus("Export cancelled");
  };

  const exportAsPNG = async () => {
    if (data.length === 0) return;

    setIsExporting(true);
    setExportProgress(0);
    setCurrentBatch(0);
    cancelExport.current = false;

    const totalBatches = Math.ceil(data.length / batchSize);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      if (cancelExport.current) break;

      setCurrentBatch(batchIndex + 1);
      setExportStatus(`Processing batch ${batchIndex + 1} of ${totalBatches}`);

      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, data.length);
      const batchData = data.slice(startIndex, endIndex);

      // Process batch
      for (let i = 0; i < batchData.length; i++) {
        if (cancelExport.current) break;

        const sticker = batchData[i];
        const globalIndex = startIndex + i;

        setExportStatus(
          `Batch ${batchIndex + 1}: Generating sticker ${i + 1}/${
            batchData.length
          }`
        );

        const imageDataUrl = await generateStickerImage(sticker);
        const link = document.createElement("a");

        const fileName =
          sticker.number !== undefined
            ? `sticker-${sticker.formattedNumber || sticker.number}.png`
            : `sticker-${globalIndex + 1}-${sticker.name.replace(
                /[^a-zA-Z0-9]/g,
                "_"
              )}.png`;

        link.download = fileName;
        link.href = imageDataUrl;
        link.click();

        // Update progress
        const progress = ((globalIndex + 1) / data.length) * 100;
        setExportProgress(progress);

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Delay between batches
      if (batchIndex < totalBatches - 1) {
        setExportStatus(
          `Completed batch ${batchIndex + 1}. Preparing next batch...`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!cancelExport.current) {
      setExportStatus(`✅ Export completed! ${data.length} stickers exported.`);
    }

    setIsExporting(false);
    setCurrentBatch(0);
  };

  const exportAsPDF = async () => {
    const jsPDF = await import("jspdf");
    const pdf = new jsPDF.jsPDF();

    setIsExporting(true);
    setExportProgress(0);
    cancelExport.current = false;

    // Calculate how many stickers fit per page based on dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Convert sticker dimensions to PDF units (mm)
    const stickerWidthMM = dimensions.sticker.width * 10; // cm to mm
    const stickerHeightMM = dimensions.sticker.height * 10; // cm to mm

    // Calculate grid based on sticker size
    const marginsX = 20; // 2cm margins
    const marginsY = 20; // 2cm margins
    const spacing = 10; // 1cm spacing between stickers

    const availableWidth = pageWidth - 2 * marginsX;
    const availableHeight = pageHeight - 2 * marginsY;

    const stickersPerRow = Math.floor(
      (availableWidth + spacing) / (stickerWidthMM + spacing)
    );
    const stickersPerCol = Math.floor(
      (availableHeight + spacing) / (stickerHeightMM + spacing)
    );
    const stickersPerPage = Math.max(1, stickersPerRow * stickersPerCol);

    // If stickers are too big, adjust size to fit at least one per page
    let finalStickerWidth = stickerWidthMM;
    let finalStickerHeight = stickerHeightMM;

    if (
      finalStickerWidth > availableWidth ||
      finalStickerHeight > availableHeight
    ) {
      const scale = Math.min(
        availableWidth / stickerWidthMM,
        availableHeight / stickerHeightMM
      );
      finalStickerWidth = stickerWidthMM * scale;
      finalStickerHeight = stickerHeightMM * scale;
    }

    for (let i = 0; i < data.length; i++) {
      if (cancelExport.current) break;

      if (i > 0 && i % stickersPerPage === 0) {
        pdf.addPage();
      }

      setExportStatus(`Processing sticker ${i + 1} of ${data.length}`);
      setExportProgress(((i + 1) / data.length) * 100);

      const pageIndex = i % stickersPerPage;
      const row = Math.floor(pageIndex / stickersPerRow);
      const col = pageIndex % stickersPerRow;

      const x = marginsX + col * (finalStickerWidth + spacing);
      const y = marginsY + row * (finalStickerHeight + spacing);

      const imageDataUrl = await generateStickerImage(data[i]);
      pdf.addImage(
        imageDataUrl,
        "PNG",
        x,
        y,
        finalStickerWidth,
        finalStickerHeight
      );
    }

    if (!cancelExport.current) {
      // Add metadata
      pdf.setProperties({
        title: `Stickers Batch - ${dimensions.sticker.width}x${dimensions.sticker.height}cm`,
        subject: `${data.length} stickers exported`,
        creator: "Sticker Generator Pro",
      });

      pdf.save(
        `stickers-batch-${dimensions.sticker.width}x${dimensions.sticker.height}cm-${data.length}items.pdf`
      );
      setExportStatus(`✅ PDF export completed!`);
    }

    setIsExporting(false);
  };

  const pixelDimensions = convertToPixels(dimensions);
  const totalBatches = Math.ceil(data.length / batchSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Stickers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Batch Size Configuration */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Batch Export Settings</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="batch-size" className="text-xs">
                Files per batch
              </Label>
              <Input
                id="batch-size"
                type="number"
                value={batchSize}
                onChange={(e) =>
                  setBatchSize(Math.max(1, parseInt(e.target.value) || 100))
                }
                min="1"
                max="1000"
                className="h-8"
              />
            </div>
            <div className="flex items-end">
              <div className="text-xs text-muted-foreground">
                {totalBatches} batch{totalBatches !== 1 ? "es" : ""} of{" "}
                {batchSize} files each
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="text-sm">
            <p className="font-medium">Export Configuration:</p>
            <ul className="text-xs text-muted-foreground space-y-1 mt-2">
              <li>
                📦 <strong>{data.length.toLocaleString()}</strong> sticker
                {data.length !== 1 ? "s" : ""} ready
              </li>
              <li>
                📐{" "}
                <strong>
                  {dimensions.sticker.width}×{dimensions.sticker.height}cm
                </strong>{" "}
                each
              </li>
              <li>
                🖼️{" "}
                <strong>
                  {Math.round(pixelDimensions.sticker.width)}×
                  {Math.round(pixelDimensions.sticker.height)}px
                </strong>{" "}
                at 300 DPI
              </li>
              <li>
                📄 <strong>Print size:</strong>{" "}
                {(dimensions.sticker.width / 2.54).toFixed(2)}"×
                {(dimensions.sticker.height / 2.54).toFixed(2)}"
              </li>
              <li>
                📚 <strong>Batches:</strong> {totalBatches} batches of{" "}
                {batchSize} files
              </li>
            </ul>
          </div>
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Export Progress</span>
              <Button onClick={stopExport} variant="destructive" size="sm">
                <StopCircle className="h-4 w-4 mr-1" />
                Stop Export
              </Button>
            </div>

            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              ></div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>{exportStatus}</p>
              {currentBatch > 0 && (
                <p>
                  Batch {currentBatch} of {totalBatches} •{" "}
                  {exportProgress.toFixed(1)}% complete
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-2">
          <Button
            onClick={exportAsPNG}
            disabled={data.length === 0 || isExporting}
            className="flex items-center gap-2"
          >
            <FileImage className="h-4 w-4" />
            {isExporting
              ? "Exporting..."
              : `Export as PNG (${totalBatches} batches)`}
          </Button>

          <Button
            onClick={exportAsPDF}
            disabled={data.length === 0 || isExporting}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {isExporting ? "Generating PDF..." : "Export as PDF (Single File)"}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-3">
          <p>
            <strong>PNG Export:</strong> Downloads in batches of {batchSize}{" "}
            files (configurable)
          </p>
          <p>
            <strong>PDF Export:</strong> Single file with optimized layout for
            printing
          </p>
          <p>
            <strong>Tip:</strong> For large exports (1000+), use smaller batch
            sizes to avoid browser issues
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
