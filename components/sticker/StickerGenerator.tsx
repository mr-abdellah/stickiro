"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickerCanvas } from "./StickerCanvas";
import { ContactForm } from "./ContactForm";
import { DataImporter } from "./DataImporter";
import { ExportManager } from "./ExportManager";
import { DimensionsControl } from "./DimensionsControl";
import { NumberRangeGenerator } from "./NumberRangeGenerator";
import { PDFConfig } from "./PDFConfigControl";
import { PDFPreview } from "./PDFPreview";
import {
  useStickerStore,
  useStickerActions,
  useCurrentSticker,
  useDimensions,
  usePdfConfig,
  useActiveTab,
} from "@/stores/stickerStore";
import { StickerData } from "@/lib/sticker-utils";

export const StickerGenerator = () => {
  // Use Zustand selectors for optimal performance
  const currentSticker = useCurrentSticker();
  const dimensions = useDimensions();
  const pdfConfig = usePdfConfig();
  const activeTab = useActiveTab();

  // Get all actions
  const {
    setCurrentSticker,
    setDimensions,
    setPdfConfig,
    setBulkData,
    setNumberedStickers,
    setActiveTab,
    setUIState,
    getActiveDataForExport,
    getActiveDataInfo,
  } = useStickerActions();

  // Get computed data
  const dataForExport = getActiveDataForExport();
  const activeDataInfo = getActiveDataInfo();

  const handleDataImport = (data: StickerData[]) => {
    setBulkData(data);
  };

  const handleNumberedGeneration = (stickers: StickerData[]) => {
    setNumberedStickers(stickers);
  };

  const handlePDFPreview = () => {
    setUIState({ showPDFPreview: true });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Professional Sticker Generator
        </h1>
        <p className="text-muted-foreground">
          Create custom stickers with full dimension control, numbering, and
          advanced PDF export
        </p>

        {/* Active Data Status */}
        <div className="mt-4 inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
          <span className="text-lg">{activeDataInfo.icon}</span>
          <span className={`font-medium ${activeDataInfo.color}`}>
            {activeDataInfo.type}: {activeDataInfo.count.toLocaleString()}{" "}
            sticker{activeDataInfo.count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          <TabsTrigger value="numbers">Numbers</TabsTrigger>
          <TabsTrigger value="bulk">Bulk CSV</TabsTrigger>
          <TabsTrigger value="pdf">PDF Config</TabsTrigger>
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
          <NumberRangeGeneratorWithStore
            onGenerate={handleNumberedGeneration}
          />
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

// Components that use Zustand internally
interface NumberRangeGeneratorWithStoreProps {
  onGenerate: (stickers: StickerData[]) => void;
}

const NumberRangeGeneratorWithStore = ({
  onGenerate,
}: NumberRangeGeneratorWithStoreProps) => {
  const currentSticker = useCurrentSticker();
  const { numberRangeConfig, numberedStickers } = useStickerStore((state) => ({
    numberRangeConfig: state.numberRangeConfig,
    numberedStickers: state.numberedStickers,
  }));
  const dimensions = useDimensions();

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <NumberRangeGenerator onGenerate={onGenerate} baseData={currentSticker} />
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
            <p>Configure and generate numbered stickers above</p>
            <p className="text-sm mt-2">
              Perfect for serial numbers, ID cards, or batch production
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface DataImporterWithStoreProps {
  onDataImport: (data: StickerData[]) => void;
}

const DataImporterWithStore = ({
  onDataImport,
}: DataImporterWithStoreProps) => {
  const { bulkData } = useStickerStore((state) => ({
    bulkData: state.bulkData,
  }));
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
  const { getActiveDataForExport } = useStickerActions();
  const dataForExport = getActiveDataForExport();

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
