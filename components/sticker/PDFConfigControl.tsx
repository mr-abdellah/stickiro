"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Settings, Eye, RotateCcw } from "lucide-react";
import { StickerDimensions } from "@/lib/sticker-utils";

export interface PDFConfiguration {
  pageFormat: "A4" | "A3" | "A5" | "Letter" | "Legal" | "Custom";
  customWidth: number; // mm
  customHeight: number; // mm
  orientation: "portrait" | "landscape";
  dpi: number;
  marginTop: number; // mm
  marginBottom: number; // mm
  marginLeft: number; // mm
  marginRight: number; // mm
  paddingHorizontal: number; // mm between stickers horizontally
  paddingVertical: number; // mm between stickers vertically
  stickerScale: number; // 0.1 to 2.0 (scale factor)
  quality: "draft" | "normal" | "high";
}

export const DEFAULT_PDF_CONFIG: PDFConfiguration = {
  pageFormat: "A4",
  customWidth: 210,
  customHeight: 297,
  orientation: "portrait",
  dpi: 300,
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 10,
  marginRight: 10,
  paddingHorizontal: 5,
  paddingVertical: 5,
  stickerScale: 1.0,
  quality: "normal",
};

const PAGE_FORMATS = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
  Custom: { width: 210, height: 297 },
};

interface PDFConfigProps {
  config: PDFConfiguration;
  onChange: (config: PDFConfiguration) => void;
  stickerDimensions: StickerDimensions;
  onPreview: () => void;
}

export const PDFConfig = ({
  config,
  onChange,
  stickerDimensions,
  onPreview,
}: PDFConfigProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateConfig = (updates: Partial<PDFConfiguration>) => {
    onChange({ ...config, ...updates });
  };

  const resetToDefaults = () => {
    onChange(DEFAULT_PDF_CONFIG);
  };

  const handlePageFormatChange = (format: PDFConfiguration["pageFormat"]) => {
    const dimensions = PAGE_FORMATS[format];
    updateConfig({
      pageFormat: format,
      customWidth: dimensions.width,
      customHeight: dimensions.height,
    });
  };

  const getPageDimensions = () => {
    const { customWidth, customHeight, orientation } = config;
    return orientation === "landscape"
      ? { width: customHeight, height: customWidth }
      : { width: customWidth, height: customHeight };
  };

  const calculateLayout = () => {
    const page = getPageDimensions();
    const availableWidth = page.width - config.marginLeft - config.marginRight;
    const availableHeight =
      page.height - config.marginTop - config.marginBottom;

    const stickerWidthMM =
      stickerDimensions.sticker.width * 10 * config.stickerScale;
    const stickerHeightMM =
      stickerDimensions.sticker.height * 10 * config.stickerScale;

    const stickersPerRow = Math.floor(
      (availableWidth + config.paddingHorizontal) /
        (stickerWidthMM + config.paddingHorizontal)
    );
    const stickersPerCol = Math.floor(
      (availableHeight + config.paddingVertical) /
        (stickerHeightMM + config.paddingVertical)
    );

    return {
      stickersPerRow: Math.max(1, stickersPerRow),
      stickersPerCol: Math.max(1, stickersPerCol),
      stickersPerPage: Math.max(1, stickersPerRow * stickersPerCol),
      stickerWidthMM,
      stickerHeightMM,
      availableWidth,
      availableHeight,
    };
  };

  const layout = calculateLayout();
  const page = getPageDimensions();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              PDF Export Configuration
            </CardTitle>
            <Button onClick={resetToDefaults} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Page Format */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-primary">
              Page Format
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="page-format" className="text-xs">
                  Format
                </Label>
                <Select
                  value={config.pageFormat}
                  onValueChange={handlePageFormatChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4 (210×297mm)</SelectItem>
                    <SelectItem value="A3">A3 (297×420mm)</SelectItem>
                    <SelectItem value="A5">A5 (148×210mm)</SelectItem>
                    <SelectItem value="Letter">Letter (8.5×11")</SelectItem>
                    <SelectItem value="Legal">Legal (8.5×14")</SelectItem>
                    <SelectItem value="Custom">Custom Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="orientation" className="text-xs">
                  Orientation
                </Label>
                <Select
                  value={config.orientation}
                  onValueChange={(value: string) =>
                    updateConfig({
                      orientation: value as "portrait" | "landscape",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {config.pageFormat === "Custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="custom-width" className="text-xs">
                    Width (mm)
                  </Label>
                  <Input
                    id="custom-width"
                    type="number"
                    value={config.customWidth}
                    onChange={(e) =>
                      updateConfig({
                        customWidth: parseFloat(e.target.value) || 210,
                      })
                    }
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-height" className="text-xs">
                    Height (mm)
                  </Label>
                  <Input
                    id="custom-height"
                    type="number"
                    value={config.customHeight}
                    onChange={(e) =>
                      updateConfig({
                        customHeight: parseFloat(e.target.value) || 297,
                      })
                    }
                    className="h-8"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Page Margins */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-blue-600">
              Page Margins (mm)
            </Label>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label htmlFor="margin-top" className="text-xs">
                  Top
                </Label>
                <Input
                  id="margin-top"
                  type="number"
                  value={config.marginTop}
                  onChange={(e) =>
                    updateConfig({ marginTop: parseFloat(e.target.value) || 0 })
                  }
                  className="h-8"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="margin-bottom" className="text-xs">
                  Bottom
                </Label>
                <Input
                  id="margin-bottom"
                  type="number"
                  value={config.marginBottom}
                  onChange={(e) =>
                    updateConfig({
                      marginBottom: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-8"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="margin-left" className="text-xs">
                  Left
                </Label>
                <Input
                  id="margin-left"
                  type="number"
                  value={config.marginLeft}
                  onChange={(e) =>
                    updateConfig({
                      marginLeft: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-8"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="margin-right" className="text-xs">
                  Right
                </Label>
                <Input
                  id="margin-right"
                  type="number"
                  value={config.marginRight}
                  onChange={(e) =>
                    updateConfig({
                      marginRight: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-8"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Sticker Spacing */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-green-600">
              Sticker Spacing (mm)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="padding-horizontal" className="text-xs">
                  Horizontal Gap
                </Label>
                <Input
                  id="padding-horizontal"
                  type="number"
                  value={config.paddingHorizontal}
                  onChange={(e) =>
                    updateConfig({
                      paddingHorizontal: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-8"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="padding-vertical" className="text-xs">
                  Vertical Gap
                </Label>
                <Input
                  id="padding-vertical"
                  type="number"
                  value={config.paddingVertical}
                  onChange={(e) =>
                    updateConfig({
                      paddingVertical: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-8"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Sticker Scale */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-orange-600">
              Sticker Size
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sticker-scale" className="text-xs">
                  Scale Factor
                </Label>
                <Input
                  id="sticker-scale"
                  type="number"
                  step="0.1"
                  value={config.stickerScale}
                  onChange={(e) =>
                    updateConfig({
                      stickerScale: parseFloat(e.target.value) || 1,
                    })
                  }
                  className="h-8"
                  min="0.1"
                  max="3.0"
                />
              </div>
              <div className="flex items-end">
                <div className="text-xs text-muted-foreground">
                  {layout.stickerWidthMM.toFixed(1)}×
                  {layout.stickerHeightMM.toFixed(1)}mm per sticker
                </div>
              </div>
            </div>
          </div>

          {/* Quality Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-purple-600">
              Quality Settings
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dpi" className="text-xs">
                  DPI Resolution
                </Label>
                <Select
                  value={config.dpi.toString()}
                  onValueChange={(value: string) =>
                    updateConfig({ dpi: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="150">150 DPI (Draft)</SelectItem>
                    <SelectItem value="300">300 DPI (Standard)</SelectItem>
                    <SelectItem value="600">600 DPI (High Quality)</SelectItem>
                    <SelectItem value="1200">
                      1200 DPI (Print Quality)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quality" className="text-xs">
                  Compression
                </Label>
                <Select
                  value={config.quality}
                  onValueChange={(value: string) =>
                    updateConfig({
                      quality: value as PDFConfiguration["quality"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Smaller file)</SelectItem>
                    <SelectItem value="normal">Normal (Balanced)</SelectItem>
                    <SelectItem value="high">High (Larger file)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              {showAdvanced ? "Hide" : "Show"} Advanced Settings
            </Button>
          </div>

          {showAdvanced && (
            <div className="space-y-4">
              {/* Quick Presets */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Quick Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateConfig({
                        marginTop: 5,
                        marginBottom: 5,
                        marginLeft: 5,
                        marginRight: 5,
                        paddingHorizontal: 2,
                        paddingVertical: 2,
                        stickerScale: 0.8,
                      })
                    }
                  >
                    Compact Layout
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateConfig({
                        marginTop: 20,
                        marginBottom: 20,
                        marginLeft: 20,
                        marginRight: 20,
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                        stickerScale: 1.0,
                      })
                    }
                  >
                    Spacious Layout
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateConfig({
                        marginTop: 15,
                        marginBottom: 15,
                        marginLeft: 15,
                        marginRight: 15,
                        paddingHorizontal: 8,
                        paddingVertical: 8,
                        stickerScale: 1.2,
                      })
                    }
                  >
                    Large Stickers
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateConfig({
                        marginTop: 3,
                        marginBottom: 3,
                        marginLeft: 3,
                        marginRight: 3,
                        paddingHorizontal: 1,
                        paddingVertical: 1,
                        stickerScale: 0.6,
                      })
                    }
                  >
                    Maximum Density
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Layout Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Layout Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Page Size:</strong> {page.width}×{page.height}mm
                  </p>
                  <p>
                    <strong>Usable Area:</strong>{" "}
                    {layout.availableWidth.toFixed(1)}×
                    {layout.availableHeight.toFixed(1)}mm
                  </p>
                  <p>
                    <strong>Sticker Size:</strong>{" "}
                    {layout.stickerWidthMM.toFixed(1)}×
                    {layout.stickerHeightMM.toFixed(1)}mm
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Layout:</strong> {layout.stickersPerRow}×
                    {layout.stickersPerCol} grid
                  </p>
                  <p>
                    <strong>Per Page:</strong> {layout.stickersPerPage} stickers
                  </p>
                  <p>
                    <strong>Resolution:</strong> {config.dpi} DPI
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-sm">
                {layout.stickersPerPage} stickers per page
              </Badge>
              <Button onClick={onPreview} variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Preview Page Layout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
