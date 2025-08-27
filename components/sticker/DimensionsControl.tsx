"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ruler, RotateCcw } from "lucide-react";
import { StickerDimensions, DEFAULT_DIMENSIONS } from "@/lib/sticker-utils";

interface DimensionsControlProps {
  dimensions: StickerDimensions;
  onChange: (dimensions: StickerDimensions) => void;
}

export const DimensionsControl = ({
  dimensions,
  onChange,
}: DimensionsControlProps) => {
  const handleDimensionChange = (
    section: keyof StickerDimensions,
    property: string,
    value: number
  ) => {
    const newDimensions = {
      ...dimensions,
      [section]: {
        ...dimensions[section],
        [property]: value,
      },
    };
    onChange(newDimensions);
  };

  const resetToDefaults = () => {
    onChange(DEFAULT_DIMENSIONS);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Dimensions Control (CM)
        </CardTitle>
        <Button
          onClick={resetToDefaults}
          variant="outline"
          size="sm"
          className="ml-auto"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset to Default
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sticker Overall Size */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-primary">
            Overall Sticker Size
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sticker-width" className="text-xs">
                Width (cm)
              </Label>
              <Input
                id="sticker-width"
                type="number"
                step="0.1"
                value={dimensions.sticker.width}
                onChange={(e) =>
                  handleDimensionChange(
                    "sticker",
                    "width",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="sticker-height" className="text-xs">
                Height (cm)
              </Label>
              <Input
                id="sticker-height"
                type="number"
                step="0.1"
                value={dimensions.sticker.height}
                onChange={(e) =>
                  handleDimensionChange(
                    "sticker",
                    "height",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Logo Dimensions */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-blue-600">
            Logo Area
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="logo-width" className="text-xs">
                Width (cm)
              </Label>
              <Input
                id="logo-width"
                type="number"
                step="0.1"
                value={dimensions.logo.width}
                onChange={(e) =>
                  handleDimensionChange(
                    "logo",
                    "width",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="logo-height" className="text-xs">
                Height (cm)
              </Label>
              <Input
                id="logo-height"
                type="number"
                step="0.1"
                value={dimensions.logo.height}
                onChange={(e) =>
                  handleDimensionChange(
                    "logo",
                    "height",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* QR Code Dimensions */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-green-600">
            QR Code
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="qr-width" className="text-xs">
                Width (cm)
              </Label>
              <Input
                id="qr-width"
                type="number"
                step="0.1"
                value={dimensions.qr.width}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  // Keep QR code square
                  handleDimensionChange("qr", "width", value);
                  handleDimensionChange("qr", "height", value);
                }}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="qr-height" className="text-xs">
                Height (cm)
              </Label>
              <Input
                id="qr-height"
                type="number"
                step="0.1"
                value={dimensions.qr.height}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  // Keep QR code square
                  handleDimensionChange("qr", "width", value);
                  handleDimensionChange("qr", "height", value);
                }}
                className="h-8"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            QR codes are automatically kept square
          </p>
        </div>

        {/* Contact Area Dimensions */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-orange-600">
            Contact Info Area
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="contact-width" className="text-xs">
                Width (cm)
              </Label>
              <Input
                id="contact-width"
                type="number"
                step="0.1"
                value={dimensions.contact.width}
                onChange={(e) =>
                  handleDimensionChange(
                    "contact",
                    "width",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="contact-height" className="text-xs">
                Height (cm)
              </Label>
              <Input
                id="contact-height"
                type="number"
                step="0.1"
                value={dimensions.contact.height}
                onChange={(e) =>
                  handleDimensionChange(
                    "contact",
                    "height",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Spacing Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-purple-600">
            Spacing Between Sections
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="spacing-top" className="text-xs">
                Top (cm)
              </Label>
              <Input
                id="spacing-top"
                type="number"
                step="0.1"
                value={dimensions.spacing.top}
                onChange={(e) =>
                  handleDimensionChange(
                    "spacing",
                    "top",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="spacing-middle" className="text-xs">
                Middle (cm)
              </Label>
              <Input
                id="spacing-middle"
                type="number"
                step="0.1"
                value={dimensions.spacing.middle}
                onChange={(e) =>
                  handleDimensionChange(
                    "spacing",
                    "middle",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="spacing-bottom" className="text-xs">
                Bottom (cm)
              </Label>
              <Input
                id="spacing-bottom"
                type="number"
                step="0.1"
                value={dimensions.spacing.bottom}
                onChange={(e) =>
                  handleDimensionChange(
                    "spacing",
                    "bottom",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Quick Size Presets */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Quick Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onChange({
                  sticker: { width: 5, height: 8 },
                  logo: { width: 3.8, height: 2.6 },
                  qr: { width: 3.1, height: 3.1 },
                  contact: { width: 3.8, height: 1.0 },
                  spacing: { top: 0.3, middle: 0.3, bottom: 0.3 },
                })
              }
            >
              Original
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onChange({
                  sticker: { width: 7.0, height: 7.0 },
                  logo: { width: 4.5, height: 3.0 },
                  qr: { width: 3.5, height: 3.5 },
                  contact: { width: 4.5, height: 1.2 },
                  spacing: { top: 0.4, middle: 0.4, bottom: 0.4 },
                })
              }
            >
              Large
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onChange({
                  sticker: { width: 4.0, height: 4.0 },
                  logo: { width: 2.8, height: 1.8 },
                  qr: { width: 2.2, height: 2.2 },
                  contact: { width: 2.8, height: 0.8 },
                  spacing: { top: 0.2, middle: 0.2, bottom: 0.2 },
                })
              }
            >
              Small
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onChange({
                  sticker: { width: 8.5, height: 5.5 },
                  logo: { width: 4.0, height: 2.5 },
                  qr: { width: 2.8, height: 2.8 },
                  contact: { width: 6.0, height: 1.0 },
                  spacing: { top: 0.3, middle: 0.3, bottom: 0.3 },
                })
              }
            >
              Business Card
            </Button>
          </div>
        </div>

        {/* Size Summary */}
        <div className="bg-muted p-3 rounded-md">
          <Label className="text-xs font-medium">Current Total Size</Label>
          <p className="text-sm mt-1">
            <strong>
              {dimensions.sticker.width}cm × {dimensions.sticker.height}cm
            </strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Print size: {(dimensions.sticker.width / 2.54).toFixed(2)}&quot; ×{" "}
            {(dimensions.sticker.height / 2.54).toFixed(2)}&quot;
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
