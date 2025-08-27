"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { StickerData } from "@/lib/sticker-utils";

interface DataImporterProps {
  onDataImport: (data: StickerData[]) => void;
}

export const DataImporter = ({ onDataImport }: DataImporterProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<StickerData[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    Papa.parse<{
      name?: string;
      business_name?: string;
      phone?: string;
      telephone?: string;
      email?: string;
      website?: string;
      url?: string;
      qr_data?: string;
    }>(file, {
      header: true,
      complete: (results) => {
        try {
          const stickerData: StickerData[] = results.data.map((row, index) => ({
            id: `${index + 1}`,
            name: row.name || row.business_name || "",
            phone: row.phone || row.telephone || "",
            email: row.email || "",
            website: row.website || row.url || "",
            qrData: row.qr_data || row.website || row.url || row.phone || "",
            logo: "",
          }));

          setPreviewData(stickerData.slice(0, 5));
          setIsLoading(false);
        } catch (err) {
          setError("Error parsing CSV file. Please check the format.");
          setIsLoading(false);
        }
      },
      error: (error) => {
        setError(`Error reading file: ${error.message}`);
        setIsLoading(false);
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: false,
  });

  const handleImport = () => {
    if (previewData.length > 0) {
      onDataImport(previewData);
    }
  };

  const downloadTemplate = () => {
    const csvContent =
      "name,phone,email,website,qr_data\n" +
      "Maghreb Distrib,+213 5 59 42 44 56,contact@maghrebdistrib.com,https://maghrebdistrib.com,https://maghrebdistrib.com\n" +
      "Example Business,+213 X XX XX XX XX,info@example.com,https://example.com,https://example.com";

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sticker_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Bulk Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p>Drop the CSV file here...</p>
          ) : (
            <div>
              <p className="mb-2">
                Drag & drop a CSV file here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Supports CSV, XLS, and XLSX files
              </p>
            </div>
          )}
        </div>

        <Button onClick={downloadTemplate} variant="outline" className="w-full">
          Download CSV Template
        </Button>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {previewData.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">
              Preview ({previewData.length} records found)
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {previewData.map((item, index) => (
                <div key={index} className="text-sm p-2 bg-muted rounded">
                  <strong>{item.name}</strong> - {item.phone} - {item.email}
                </div>
              ))}
            </div>
            <Button onClick={handleImport} className="w-full mt-4">
              Import {previewData.length} Records
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center text-sm text-muted-foreground">
            Processing file...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
