import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  StickerData,
  StickerDimensions,
  DEFAULT_DIMENSIONS,
} from "@/lib/sticker-utils";
import {
  PDFConfiguration,
  DEFAULT_PDF_CONFIG,
} from "@/components/sticker/PDFConfigControl";

interface StickerStore {
  // Current sticker data
  currentSticker: StickerData;
  setCurrentSticker: (sticker: StickerData) => void;

  // Dimensions configuration
  dimensions: StickerDimensions;
  setDimensions: (dimensions: StickerDimensions) => void;

  // PDF configuration
  pdfConfig: PDFConfiguration;
  setPdfConfig: (config: PDFConfiguration) => void;

  // Bulk data from CSV
  bulkData: StickerData[];
  setBulkData: (data: StickerData[]) => void;

  // Numbered stickers
  numberedStickers: StickerData[];
  setNumberedStickers: (stickers: StickerData[]) => void;

  // Number range generator config
  numberRangeConfig: {
    startNumber: number;
    endNumber: number;
    prefix: string;
    suffix: string;
    paddingLength: number;
    includeInQR: boolean;
    includeInName: boolean;
    qrNumberOnly: boolean;
  };
  setNumberRangeConfig: (
    config: Partial<StickerStore["numberRangeConfig"]>
  ) => void;

  // Export settings
  exportConfig: {
    batchSize: number;
    isExporting: boolean;
    exportProgress: number;
    currentBatch: number;
    exportStatus: string;
  };
  setExportConfig: (config: Partial<StickerStore["exportConfig"]>) => void;

  // Active tab
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // UI state
  uiState: {
    showPDFPreview: boolean;
    showAdvancedSettings: boolean;
  };
  setUIState: (state: Partial<StickerStore["uiState"]>) => void;

  // Computed getters
  getActiveDataForExport: () => StickerData[];
  getActiveDataInfo: () => {
    type: string;
    count: number;
    color: string;
    icon: string;
  };

  // Reset functions
  resetBulkData: () => void;
  resetNumberedStickers: () => void;
  resetAllData: () => void;
}

export const useStickerStore = create<StickerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSticker: {
        id: "1",
        name: "Maghreb Distrib",
        phone: "+213 5 59 42 44 56",
        email: "commercialmaghrebdistrib@gmail.com",
        website: "https://maghrebdistrib.com",
        qrData: "https://maghrebdistrib.com",
      },

      dimensions: DEFAULT_DIMENSIONS,
      pdfConfig: DEFAULT_PDF_CONFIG,
      bulkData: [],
      numberedStickers: [],

      numberRangeConfig: {
        startNumber: 10000,
        endNumber: 14000,
        prefix: "",
        suffix: "",
        paddingLength: 0,
        includeInQR: true,
        includeInName: false,
        qrNumberOnly: true,
      },

      exportConfig: {
        batchSize: 100,
        isExporting: false,
        exportProgress: 0,
        currentBatch: 0,
        exportStatus: "",
      },

      activeTab: "design",

      uiState: {
        showPDFPreview: false,
        showAdvancedSettings: false,
      },

      // Actions
      setCurrentSticker: (sticker) => set({ currentSticker: sticker }),

      setDimensions: (dimensions) => set({ dimensions }),

      setPdfConfig: (config) => set({ pdfConfig: config }),

      setBulkData: (data) =>
        set({
          bulkData: data,
          numberedStickers: [], // Clear numbered when setting bulk
        }),

      setNumberedStickers: (stickers) =>
        set({
          numberedStickers: stickers,
          bulkData: [], // Clear bulk when setting numbered
        }),

      setNumberRangeConfig: (config) =>
        set((state) => ({
          numberRangeConfig: { ...state.numberRangeConfig, ...config },
        })),

      setExportConfig: (config) =>
        set((state) => ({
          exportConfig: { ...state.exportConfig, ...config },
        })),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setUIState: (state) =>
        set((currentState) => ({
          uiState: { ...currentState.uiState, ...state },
        })),

      // Computed getters
      getActiveDataForExport: () => {
        const state = get();
        if (state.numberedStickers.length > 0) {
          return state.numberedStickers;
        }
        if (state.bulkData.length > 0) {
          return state.bulkData;
        }
        return [state.currentSticker];
      },

      getActiveDataInfo: () => {
        const state = get();
        if (state.numberedStickers.length > 0) {
          return {
            type: "Numbered Stickers",
            count: state.numberedStickers.length,
            color: "text-green-600",
            icon: "#",
          };
        }
        if (state.bulkData.length > 0) {
          return {
            type: "CSV Import",
            count: state.bulkData.length,
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
      },

      // Reset functions
      resetBulkData: () => set({ bulkData: [] }),
      resetNumberedStickers: () => set({ numberedStickers: [] }),
      resetAllData: () =>
        set({
          bulkData: [],
          numberedStickers: [],
          exportConfig: {
            batchSize: 100,
            isExporting: false,
            exportProgress: 0,
            currentBatch: 0,
            exportStatus: "",
          },
        }),
    }),
    {
      name: "sticker-generator-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),

      // Only persist important data, not UI state
      partialize: (state) => ({
        currentSticker: state.currentSticker,
        dimensions: state.dimensions,
        pdfConfig: state.pdfConfig,
        numberRangeConfig: state.numberRangeConfig,
        exportConfig: {
          batchSize: state.exportConfig.batchSize, // Only persist batch size
        },
        activeTab: state.activeTab,
        // Don't persist: bulkData, numberedStickers (too large), uiState, exportProgress
      }),

      // Version for migration if needed
      version: 1,
    }
  )
);

// Selectors for performance optimization
export const useCurrentSticker = () =>
  useStickerStore((state) => state.currentSticker);
export const useDimensions = () => useStickerStore((state) => state.dimensions);
export const usePdfConfig = () => useStickerStore((state) => state.pdfConfig);
export const useBulkData = () => useStickerStore((state) => state.bulkData);
export const useNumberedStickers = () =>
  useStickerStore((state) => state.numberedStickers);
export const useNumberRangeConfig = () =>
  useStickerStore((state) => state.numberRangeConfig);
export const useExportConfig = () =>
  useStickerStore((state) => state.exportConfig);
export const useActiveTab = () => useStickerStore((state) => state.activeTab);
export const useUIState = () => useStickerStore((state) => state.uiState);

// Action selectors
export const useStickerActions = () =>
  useStickerStore((state) => ({
    setCurrentSticker: state.setCurrentSticker,
    setDimensions: state.setDimensions,
    setPdfConfig: state.setPdfConfig,
    setBulkData: state.setBulkData,
    setNumberedStickers: state.setNumberedStickers,
    setNumberRangeConfig: state.setNumberRangeConfig,
    setExportConfig: state.setExportConfig,
    setActiveTab: state.setActiveTab,
    setUIState: state.setUIState,
    getActiveDataForExport: state.getActiveDataForExport,
    getActiveDataInfo: state.getActiveDataInfo,
    resetBulkData: state.resetBulkData,
    resetNumberedStickers: state.resetNumberedStickers,
    resetAllData: state.resetAllData,
  }));
