"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StickerCanvas } from "./StickerCanvas";
import { ContactForm } from "./ContactForm";
import { DataImporter } from "./DataImporter";
import { ExportManager } from "./ExportManager";
import { DimensionsControl } from "./DimensionsControl";
import { NumberRangeGenerator } from "./NumberRangeGenerator";
import { PDFConfig } from "./PDFConfigControl";
import { PDFPreview } from "./PDFPreview";
import {
  useCurrentSticker,
  useDimensions,
  usePdfConfig,
  useActiveTab,
  useSetCurrentSticker,
  useSetDimensions,
  useSetPdfConfig,
  useSetBulkData,
  useSetNumberedStickers,
  useSetActiveTab,
  useSetUIState,
  useActiveDataForExport,
  useActiveDataInfo,
  useNumberedStickers,
  useBulkData,
  useNumberRangeConfig,
  useSetNumberRangeConfig,
} from "@/stores/stickerStore";
import { StickerData } from "@/lib/sticker-utils";
import { useEffect } from "react";
import { Zap, RefreshCw } from "lucide-react";

export const StickerGenerator = () => {
  // Selectors
  const currentSticker = useCurrentSticker();
  const dimensions = useDimensions();
  const pdfConfig = usePdfConfig();
  const activeTab = useActiveTab();
  const numberedStickers = useNumberedStickers();
  const bulkData = useBulkData();
  const numberRangeConfig = useNumberRangeConfig();

  // Actions
  const setCurrentSticker = useSetCurrentSticker();
  const setDimensions = useSetDimensions();
  const setPdfConfig = useSetPdfConfig();
  const setBulkData = useSetBulkData();
  const setNumberedStickers = useSetNumberedStickers();
  const setActiveTab = useSetActiveTab();
  const setUIState = useSetUIState();
  const setNumberRangeConfig = useSetNumberRangeConfig();

  // Computed data
  const activeData = useActiveDataForExport();
  const dataForExport = activeData();
  const activeInfo = useActiveDataInfo();
  const activeDataInfo = activeInfo();

  // Auto-generate numbered stickers when config changes
  useEffect(() => {
    if (
      activeTab === "numbers" &&
      numberRangeConfig.startNumber &&
      numberRangeConfig.endNumber
    ) {
      generateNumberedStickersAuto();
    }
  }, [numberRangeConfig, activeTab]);

  const generateNumberedStickersAuto = () => {
    const {
      startNumber,
      endNumber,
      prefix,
      suffix,
      paddingLength,
      qrNumberOnly,
    } = numberRangeConfig;

    if (startNumber > endNumber) return;

    const stickers: StickerData[] = [];

    for (let i = startNumber; i <= endNumber; i++) {
      let formatted = i.toString();
      if (paddingLength > 0) {
        formatted = formatted.padStart(paddingLength, "0");
      }
      const formattedNumber = `${prefix}${formatted}${suffix}`;

      const qrCodeValue = qrNumberOnly
        ? i.toString()
        : `${
            currentSticker.qrData ||
            currentSticker.website ||
            currentSticker.phone
          }?id=${formattedNumber}`;

      const sticker: StickerData = {
        ...currentSticker,
        id: `sticker-${i}`,
        number: i,
        formattedNumber,
        name: numberRangeConfig.includeInName
          ? `${currentSticker.name} #${formattedNumber}`
          : currentSticker.name,
        qrData: qrCodeValue,
      };

      stickers.push(sticker);
    }

    setNumberedStickers(stickers);
  };

  const handleDataImport = (data: StickerData[]) => {
    setBulkData(data);
  };

  const handlePDFPreview = () => {
    setUIState({ showPDFPreview: true });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleManualGenerate = () => {
    if (activeTab === "numbers") {
      generateNumberedStickersAuto();
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header with Generate Button */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Professional Sticker Generator
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Create custom stickers with full dimension control, numbering, and
            advanced PDF export
          </p>
        </div>

        {/* Generate Button & Status */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Active Data Status */}
          <div className="inline-flex items-center gap-2 bg-muted px-3 md:px-4 py-2 rounded-full">
            <span className="text-base md:text-lg">{activeDataInfo.icon}</span>
            <span
              className={`font-medium text-xs md:text-sm ${activeDataInfo.color}`}
            >
              {activeDataInfo.type}: {activeDataInfo.count.toLocaleString()}{" "}
              sticker{activeDataInfo.count !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Generate Button */}
          {activeTab === "numbers" && (
            <Button
              onClick={handleManualGenerate}
              className="flex items-center gap-2"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
              Generate Now
            </Button>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        {/* Responsive TabsList */}
        <div className="overflow-x-auto">
          <TabsList className="grid grid-cols-6 w-full min-w-[600px] md:min-w-0">
            <TabsTrigger value="design" className="text-xs md:text-sm">
              Design
            </TabsTrigger>
            <TabsTrigger value="dimensions" className="text-xs md:text-sm">
              Dimensions
            </TabsTrigger>
            <TabsTrigger value="numbers" className="text-xs md:text-sm">
              Numbers
            </TabsTrigger>
            <TabsTrigger value="bulk" className="text-xs md:text-sm">
              Bulk CSV
            </TabsTrigger>
            <TabsTrigger value="pdf" className="text-xs md:text-sm">
              PDF Config
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs md:text-sm">
              Export
            </TabsTrigger>
          </TabsList>
        </div>

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
                  {(dimensions.sticker.width / 2.54).toFixed(2)}&quot; ×{" "}
                  {(dimensions.sticker.height / 2.54).toFixed(2)}&quot;
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
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="numbers" className="space-y-6">
          <NumberRangeGeneratorWithStore />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <DataImporterWithStore onDataImport={handleDataImport} />
        </TabsContent>

        <TabsContent value="pdf" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <PDFConfig
              config={pdfConfig}
              onChange={setPdfConfig}
              stickerDimensions={dimensions}
              onPreview={handlePDFPreview}
            />
            <PDFPreview
              config={pdfConfig}
              stickerDimensions={dimensions}
              sampleSticker={dataForExport[0] || currentSticker}
            />
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ExportManagerWithStore />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Updated components with auto-update
const NumberRangeGeneratorWithStore = () => {
  const currentSticker = useCurrentSticker();
  const numberedStickers = useNumberedStickers();
  const dimensions = useDimensions();
  const numberRangeConfig = useNumberRangeConfig();
  const setNumberRangeConfig = useSetNumberRangeConfig();

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <NumberRangeGenerator
        onGenerate={() => {}} // Empty because auto-update handles it
        baseData={currentSticker}
        config={numberRangeConfig}
        onConfigChange={setNumberRangeConfig}
      />
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Generated Preview</h3>
        {numberedStickers.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                ✅ {numberedStickers.length.toLocaleString()} numbered stickers
                generated
              </p>
              <p className="text-xs text-green-600 mt-1">
                QR Range: {numberedStickers[0]?.qrData} to{" "}
                {numberedStickers[numberedStickers.length - 1]?.qrData}
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
                    QR: {sticker.qrData}
                  </p>
                </div>
              ))}
            </div>

            {numberedStickers.length > 4 && (
              <p className="text-center text-sm text-muted-foreground">
                ... and {(numberedStickers.length - 4).toLocaleString()} more
                stickers
              </p>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-6xl mb-4">#️⃣</div>
            <p>Configure number range above</p>
            <p className="text-sm mt-2">Stickers auto-generate as you type</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DataImporterWithStore = ({
  onDataImport,
}: {
  onDataImport: (data: StickerData[]) => void;
}) => {
  const bulkData = useBulkData();
  const dimensions = useDimensions();

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <DataImporter onDataImport={onDataImport} />
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Bulk Preview</h3>
        {bulkData.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                📊 {bulkData.length.toLocaleString()} stickers loaded from CSV
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
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-6xl mb-4">📊</div>
            <p>Import CSV data to see bulk preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ExportManagerWithStore = () => {
  const dimensions = useDimensions();
  const pdfConfig = usePdfConfig();
  const activeData = useActiveDataForExport();
  const dataForExport = activeData();

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <ExportManager
        data={dataForExport}
        dimensions={dimensions}
        pdfConfig={pdfConfig}
      />
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Export Preview</h3>
        {dataForExport.length > 0 && (
          <StickerCanvas data={dataForExport[0]} dimensions={dimensions} />
        )}
      </div>
    </div>
  );
};
