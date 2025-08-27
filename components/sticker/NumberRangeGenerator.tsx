"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Hash, Settings, AlertTriangle } from "lucide-react";
import { StickerData } from "@/lib/sticker-utils";

interface NumberRangeConfig {
  startNumber: number;
  endNumber: number;
  prefix: string;
  suffix: string;
  paddingLength: number;
  includeInQR: boolean;
  includeInName: boolean;
  qrNumberOnly: boolean;
}

interface NumberRangeGeneratorProps {
  onGenerate: (stickers: StickerData[]) => void;
  baseData: StickerData;
  config: NumberRangeConfig;
  onConfigChange: (config: Partial<NumberRangeConfig>) => void;
}

export const NumberRangeGenerator = ({
  onGenerate,
  baseData,
  config,
  onConfigChange,
}: NumberRangeGeneratorProps) => {
  const getTotalCount = () =>
    Math.max(0, config.endNumber - config.startNumber + 1);
  const isValidRange = () =>
    config.startNumber <= config.endNumber && config.startNumber >= 0;

  const handleConfigChange = <K extends keyof NumberRangeConfig>(
    field: K,
    value: NumberRangeConfig[K]
  ) => {
    onConfigChange({ [field]: value });
  };

  const formatNumber = (num: number): string => {
    let formatted = num.toString();
    if (config.paddingLength > 0) {
      formatted = formatted.padStart(config.paddingLength, "0");
    }
    return `${config.prefix}${formatted}${config.suffix}`;
  };

  const previewNumbers = (): string[] => {
    if (!isValidRange()) return [];
    const examples = [];
    const total = getTotalCount();

    if (total <= 5) {
      for (let i = config.startNumber; i <= config.endNumber; i++) {
        examples.push(formatNumber(i));
      }
    } else {
      examples.push(formatNumber(config.startNumber));
      examples.push(formatNumber(config.startNumber + 1));
      examples.push("...");
      examples.push(formatNumber(config.endNumber - 1));
      examples.push(formatNumber(config.endNumber));
    }

    return examples;
  };

  const getQrPreview = (): string => {
    if (config.qrNumberOnly) {
      return config.startNumber.toString();
    }
    if (config.includeInQR && (baseData.qrData || baseData.website)) {
      return `${baseData.qrData || baseData.website}?id=${formatNumber(
        config.startNumber
      )}`;
    }
    return baseData.qrData || baseData.website || config.startNumber.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Auto Number Range Generator
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
                value={config.startNumber}
                onChange={(e) =>
                  handleConfigChange(
                    "startNumber",
                    parseInt(e.target.value) || 0
                  )
                }
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
                value={config.endNumber}
                onChange={(e) =>
                  handleConfigChange("endNumber", parseInt(e.target.value) || 0)
                }
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
                Total stickers auto-generating:{" "}
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
                value={config.prefix}
                onChange={(e) => handleConfigChange("prefix", e.target.value)}
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
                value={config.paddingLength}
                onChange={(e) =>
                  handleConfigChange(
                    "paddingLength",
                    parseInt(e.target.value) || 0
                  )
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
                value={config.suffix}
                onChange={(e) => handleConfigChange("suffix", e.target.value)}
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
                checked={config.qrNumberOnly}
                onCheckedChange={(value) =>
                  handleConfigChange("qrNumberOnly", value)
                }
              />
            </div>

            {!config.qrNumberOnly && (
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Include in QR URL</Label>
                  <p className="text-xs text-muted-foreground">
                    Add number to QR code URL as parameter
                  </p>
                </div>
                <Switch
                  checked={config.includeInQR}
                  onCheckedChange={(value) =>
                    handleConfigChange("includeInQR", value)
                  }
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Include in Business Name</Label>
                <p className="text-xs text-muted-foreground">
                  Append number to business name
                </p>
              </div>
              <Switch
                checked={config.includeInName}
                onCheckedChange={(value) =>
                  handleConfigChange("includeInName", value)
                }
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        {isValidRange() && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-purple-600">
              Live Preview
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
              onClick={() =>
                onConfigChange({
                  startNumber: 1,
                  endNumber: 1000,
                  prefix: "",
                  suffix: "",
                  paddingLength: 4,
                  qrNumberOnly: true,
                })
              }
            >
              1K Numbers Only
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onConfigChange({
                  startNumber: 10000,
                  endNumber: 14000,
                  prefix: "",
                  suffix: "",
                  paddingLength: 0,
                  qrNumberOnly: true,
                })
              }
            >
              10K-14K Numbers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onConfigChange({
                  startNumber: 1,
                  endNumber: 100,
                  prefix: "ID-",
                  suffix: "",
                  paddingLength: 3,
                  qrNumberOnly: false,
                })
              }
            >
              100 with URLs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onConfigChange({
                  startNumber: 50000,
                  endNumber: 99999,
                  prefix: "",
                  suffix: "",
                  paddingLength: 0,
                  qrNumberOnly: true,
                })
              }
            >
              50K Serial Numbers
            </Button>
          </div>
        </div>

        {/* Auto-Generate Status */}
        <div className="bg-green-50 border border-green-200 p-3 rounded-md">
          <p className="text-sm font-medium text-green-800">
            ✨ Auto-Update Enabled
          </p>
          <p className="text-xs text-green-600 mt-1">
            Stickers automatically generate as you change settings above
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
