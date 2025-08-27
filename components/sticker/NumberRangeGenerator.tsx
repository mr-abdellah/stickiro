"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Hash, Settings, Zap, AlertTriangle } from "lucide-react";
import { StickerData } from "@/lib/sticker-utils";

interface NumberRangeGeneratorProps {
  onGenerate: (stickers: StickerData[]) => void;
  baseData: StickerData;
}

export const NumberRangeGenerator = ({
  onGenerate,
  baseData,
}: NumberRangeGeneratorProps) => {
  const [startNumber, setStartNumber] = useState(10000);
  const [endNumber, setEndNumber] = useState(14000);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [includeInQR, setIncludeInQR] = useState(true);
  const [includeInName, setIncludeInName] = useState(false);
  const [qrNumberOnly, setQrNumberOnly] = useState(true); // NEW: QR code uses number only
  const [paddingLength, setPaddingLength] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const getTotalCount = () => Math.max(0, endNumber - startNumber + 1);
  const isValidRange = () => startNumber <= endNumber && startNumber >= 0;

  const formatNumber = (num: number): string => {
    let formatted = num.toString();
    if (paddingLength > 0) {
      formatted = formatted.padStart(paddingLength, "0");
    }
    return `${prefix}${formatted}${suffix}`;
  };

  const generateStickers = async () => {
    if (!isValidRange()) return;

    setIsGenerating(true);

    const stickers: StickerData[] = [];

    for (let i = startNumber; i <= endNumber; i++) {
      const formattedNumber = formatNumber(i);

      // QR Code Logic: Use number only if qrNumberOnly is true, otherwise use original qrData with number
      let qrCodeValue = "";
      if (qrNumberOnly) {
        qrCodeValue = i.toString(); // Just the number
      } else if (includeInQR && (baseData.qrData || baseData.website)) {
        qrCodeValue = `${
          baseData.qrData || baseData.website
        }?id=${formattedNumber}`;
      } else {
        qrCodeValue = baseData.qrData || baseData.website || i.toString();
      }

      const sticker: StickerData = {
        ...baseData,
        id: `sticker-${i}`,
        number: i,
        formattedNumber,
        name: includeInName
          ? `${baseData.name} #${formattedNumber}`
          : baseData.name,
        qrData: qrCodeValue,
      };

      stickers.push(sticker);
    }

    // Small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 100));

    onGenerate(stickers);
    setIsGenerating(false);
  };

  const previewNumbers = () => {
    if (!isValidRange()) return [];
    const examples = [];
    const total = getTotalCount();

    if (total <= 5) {
      for (let i = startNumber; i <= endNumber; i++) {
        examples.push(formatNumber(i));
      }
    } else {
      examples.push(formatNumber(startNumber));
      examples.push(formatNumber(startNumber + 1));
      examples.push("...");
      examples.push(formatNumber(endNumber - 1));
      examples.push(formatNumber(endNumber));
    }

    return examples;
  };

  const getQrPreview = () => {
    if (qrNumberOnly) {
      return startNumber.toString();
    }
    if (includeInQR && (baseData.qrData || baseData.website)) {
      return `${baseData.qrData || baseData.website}?id=${formatNumber(
        startNumber
      )}`;
    }
    return baseData.qrData || baseData.website || startNumber.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Number Range Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Range Configuration */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-primary">
            Number Range
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-number" className="text-xs">
                Start Number
              </Label>
              <Input
                id="start-number"
                type="number"
                value={startNumber}
                onChange={(e) => setStartNumber(parseInt(e.target.value) || 0)}
                className="h-9"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="end-number" className="text-xs">
                End Number
              </Label>
              <Input
                id="end-number"
                type="number"
                value={endNumber}
                onChange={(e) => setEndNumber(parseInt(e.target.value) || 0)}
                className="h-9"
                min="0"
              />
            </div>
          </div>

          {!isValidRange() && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4" />
              Invalid range: Start number must be ≤ End number
            </div>
          )}

          {isValidRange() && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium">
                Total stickers to generate:{" "}
                <Badge variant="secondary">
                  {getTotalCount().toLocaleString()}
                </Badge>
              </p>
            </div>
          )}
        </div>

        {/* Formatting Options */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-blue-600 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Number Formatting
          </Label>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="prefix" className="text-xs">
                Prefix
              </Label>
              <Input
                id="prefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="e.g., ID-"
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="padding" className="text-xs">
                Zero Padding
              </Label>
              <Input
                id="padding"
                type="number"
                value={paddingLength}
                onChange={(e) =>
                  setPaddingLength(parseInt(e.target.value) || 0)
                }
                placeholder="0"
                min="0"
                max="10"
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="suffix" className="text-xs">
                Suffix
              </Label>
              <Input
                id="suffix"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="e.g., -DZ"
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* QR Code Options */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-green-600">
            QR Code Configuration
          </Label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Use Number Only in QR</Label>
                <p className="text-xs text-muted-foreground">
                  QR code contains just the number (e.g., &quot;10137&quot;)
                </p>
              </div>
              <Switch
                checked={qrNumberOnly}
                onCheckedChange={setQrNumberOnly}
              />
            </div>

            {!qrNumberOnly && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Include in QR URL</Label>
                    <p className="text-xs text-muted-foreground">
                      Add number to QR code URL as parameter
                    </p>
                  </div>
                  <Switch
                    checked={includeInQR}
                    onCheckedChange={setIncludeInQR}
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Include in Business Name</Label>
                <p className="text-xs text-muted-foreground">
                  Append number to business name
                </p>
              </div>
              <Switch
                checked={includeInName}
                onCheckedChange={setIncludeInName}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        {isValidRange() && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-purple-600">
              Preview
            </Label>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs text-muted-foreground mb-2">
                Numbers will look like:
              </p>
              <div className="flex flex-wrap gap-1">
                {previewNumbers().map((num, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {num}
                  </Badge>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  QR Code example:
                </p>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  {getQrPreview()}
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Quick Presets */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Quick Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartNumber(1);
                setEndNumber(1000);
                setPrefix("");
                setSuffix("");
                setPaddingLength(4);
                setQrNumberOnly(true);
              }}
            >
              1K Numbers Only
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartNumber(10000);
                setEndNumber(14000);
                setPrefix("");
                setSuffix("");
                setPaddingLength(0);
                setQrNumberOnly(true);
              }}
            >
              10K-14K Numbers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartNumber(1);
                setEndNumber(100);
                setPrefix("ID-");
                setSuffix("");
                setPaddingLength(3);
                setQrNumberOnly(false);
              }}
            >
              100 with URLs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartNumber(50000);
                setEndNumber(99999);
                setPrefix("");
                setSuffix("");
                setPaddingLength(0);
                setQrNumberOnly(true);
              }}
            >
              50K Serial Numbers
            </Button>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateStickers}
          disabled={!isValidRange() || isGenerating}
          className="w-full flex items-center gap-2"
          size="lg"
        >
          <Zap className="h-4 w-4" />
          {isGenerating
            ? `Generating ${getTotalCount().toLocaleString()} stickers...`
            : `Generate ${getTotalCount().toLocaleString()} Numbered Stickers`}
        </Button>

        {isGenerating && (
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
