"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickerCanvas } from "./StickerCanvas";
import { ContactForm } from "./ContactForm";
import { DataImporter } from "./DataImporter";
import { ExportManager } from "./ExportManager";
import { DimensionsControl } from "./DimensionsControl";
import { NumberRangeGenerator } from "./NumberRangeGenerator";
import {
  StickerData,
  StickerDimensions,
  DEFAULT_DIMENSIONS,
} from "@/lib/sticker-utils";

export const StickerGenerator = () => {
  const [currentSticker, setCurrentSticker] = useState<StickerData>({
    id: "1",
    name: "Maghreb Distrib",
    phone: "+213 5 59 42 44 56",
    email: "contact@maghrebdistrib.com",
    website: "https://maghrebdistrib.com",
    qrData: "https://maghrebdistrib.com",
  });

  const [dimensions, setDimensions] =
    useState<StickerDimensions>(DEFAULT_DIMENSIONS);
  const [bulkData, setBulkData] = useState<StickerData[]>([]);
  const [numberedStickers, setNumberedStickers] = useState<StickerData[]>([]);

  const handleDataImport = (data: StickerData[]) => {
    setBulkData(data);
    setNumberedStickers([]); // Clear numbered stickers when importing CSV
  };

  const handleNumberedGeneration = (stickers: StickerData[]) => {
    setNumberedStickers(stickers);
    setBulkData([]); // Clear bulk import when using numbered generation
  };

  // Priority: numbered stickers > bulk CSV > single sticker
  const dataForExport =
    numberedStickers.length > 0
      ? numberedStickers
      : bulkData.length > 0
      ? bulkData
      : [currentSticker];

  const getActiveDataInfo = () => {
    if (numberedStickers.length > 0) {
      return {
        type: "Numbered Stickers",
        count: numberedStickers.length,
        color: "text-green-600",
        icon: "#",
      };
    }
    if (bulkData.length > 0) {
      return {
        type: "CSV Import",
        count: bulkData.length,
        color: "text-blue-600",
        icon: "📊",
      };
    }
    return {
      type: "Single Design",
      count: 1,
      color: "text-purple-600",
      icon: "🎨",
    };
  };

  const activeData = getActiveDataInfo();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Professional Sticker Generator
        </h1>
        <p className="text-muted-foreground">
          Create custom stickers with full dimension control, numbering, and QR
          codes
        </p>

        {/* Active Data Status */}
        <div className="mt-4 inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
          <span className="text-lg">{activeData.icon}</span>
          <span className={`font-medium ${activeData.color}`}>
            {activeData.type}: {activeData.count.toLocaleString()} sticker
            {activeData.count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <Tabs defaultValue="design" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          <TabsTrigger value="numbers">Numbers</TabsTrigger>
          <TabsTrigger value="bulk">Bulk CSV</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <ContactForm
              onDataChange={setCurrentSticker}
              initialData={currentSticker}
            />
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-medium">Live Preview</h3>
              <StickerCanvas data={currentSticker} dimensions={dimensions} />
              <div className="text-sm text-muted-foreground text-center bg-muted p-3 rounded-lg">
                <p>
                  <strong>Current Size:</strong> {dimensions.sticker.width}cm ×{" "}
                  {dimensions.sticker.height}cm
                </p>
                <p>
                  <strong>Print Size:</strong>{" "}
                  {(dimensions.sticker.width / 2.54).toFixed(2)}" ×{" "}
                  {(dimensions.sticker.height / 2.54).toFixed(2)}"
                </p>
                <p>
                  <strong>Resolution:</strong> 300 DPI
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dimensions" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <DimensionsControl
              dimensions={dimensions}
              onChange={setDimensions}
            />
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-medium">Real-time Preview</h3>
              <StickerCanvas data={currentSticker} dimensions={dimensions} />
              <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                <h4 className="font-medium">Current Layout:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    📏 Sticker: {dimensions.sticker.width}×
                    {dimensions.sticker.height}cm
                  </div>
                  <div>
                    🏢 Logo: {dimensions.logo.width}×{dimensions.logo.height}cm
                  </div>
                  <div>
                    📱 QR: {dimensions.qr.width}×{dimensions.qr.height}cm
                  </div>
                  <div>
                    📞 Contact: {dimensions.contact.width}×
                    {dimensions.contact.height}cm
                  </div>
                </div>
                <div className="pt-2 border-t text-xs">
                  <div>
                    🔄 Spacing: Top {dimensions.spacing.top}cm • Middle{" "}
                    {dimensions.spacing.middle}cm • Bottom{" "}
                    {dimensions.spacing.bottom}cm
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="numbers" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <NumberRangeGenerator
              onGenerate={handleNumberedGeneration}
              baseData={currentSticker}
            />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Generated Preview</h3>
              {numberedStickers.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      ✅ {numberedStickers.length.toLocaleString()} numbered
                      stickers generated
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Range: #{numberedStickers[0].formattedNumber} to #
                      {
                        numberedStickers[numberedStickers.length - 1]
                          .formattedNumber
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {numberedStickers.slice(0, 4).map((sticker, index) => (
                      <div key={index} className="text-center">
                        <StickerCanvas
                          data={sticker}
                          dimensions={dimensions}
                          className="mx-auto mb-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          #{sticker.formattedNumber}
                        </p>
                      </div>
                    ))}
                  </div>

                  {numberedStickers.length > 4 && (
                    <p className="text-center text-sm text-muted-foreground">
                      ... and {(numberedStickers.length - 4).toLocaleString()}{" "}
                      more stickers
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <div className="text-6xl mb-4">#️⃣</div>
                  <p>Configure and generate numbered stickers above</p>
                  <p className="text-sm mt-2">
                    Perfect for serial numbers, ID cards, or batch production
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <DataImporter onDataImport={handleDataImport} />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Bulk Preview</h3>
              {bulkData.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      📊 {bulkData.length.toLocaleString()} stickers loaded from
                      CSV
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Each sticker: {dimensions.sticker.width}×
                      {dimensions.sticker.height}cm
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {bulkData.slice(0, 4).map((sticker, index) => (
                      <div key={index} className="text-center">
                        <StickerCanvas
                          data={sticker}
                          dimensions={dimensions}
                          className="mx-auto mb-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {sticker.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  {bulkData.length > 4 && (
                    <p className="text-center text-sm text-muted-foreground">
                      ... and {(bulkData.length - 4).toLocaleString()} more from
                      your CSV
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <div className="text-6xl mb-4">📊</div>
                  <p>Import CSV data to see bulk preview</p>
                  <p className="text-sm mt-2">
                    Upload your contact list for mass production
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <ExportManager data={dataForExport} dimensions={dimensions} />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Export Preview</h3>
              {dataForExport.length > 0 && (
                <div className="space-y-4">
                  <StickerCanvas
                    data={dataForExport[0]}
                    dimensions={dimensions}
                  />

                  <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Export Summary</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${activeData.color} bg-background`}
                      >
                        {activeData.icon} {activeData.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p>
                          <strong>Quantity:</strong>{" "}
                          {dataForExport.length.toLocaleString()}
                        </p>
                        <p>
                          <strong>Size:</strong> {dimensions.sticker.width}×
                          {dimensions.sticker.height}cm
                        </p>
                        <p>
                          <strong>Resolution:</strong> 300 DPI
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Print Size:</strong>{" "}
                          {(dimensions.sticker.width / 2.54).toFixed(2)}"×
                          {(dimensions.sticker.height / 2.54).toFixed(2)}"
                        </p>
                        <p>
                          <strong>PNG:</strong> Individual files
                        </p>
                        <p>
                          <strong>PDF:</strong> Multi-page layout
                        </p>
                      </div>
                    </div>

                    {numberedStickers.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-green-600">
                          <strong>Number Range:</strong> #
                          {numberedStickers[0].formattedNumber} to #
                          {
                            numberedStickers[numberedStickers.length - 1]
                              .formattedNumber
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
