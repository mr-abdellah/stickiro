"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickerData } from "@/lib/sticker-utils";

interface ContactFormProps {
  onDataChange: (data: StickerData) => void;
  initialData?: Partial<StickerData>;
}

export const ContactForm = ({
  onDataChange,
  initialData,
}: ContactFormProps) => {
  const [formData, setFormData] = useState<StickerData>({
    id: "1",
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    website: initialData?.website || "",
    qrData: initialData?.qrData || "",
    logo: initialData?.logo || "",
  });

  const handleInputChange = (field: keyof StickerData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoDataUrl = event.target?.result as string;
        handleInputChange("logo", logoDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sticker Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Business Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter business name"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+213 5 59 42 44 56"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="contact@example.com"
          />
        </div>

        <div>
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <Label htmlFor="qrData">QR Code Data</Label>
          <Input
            id="qrData"
            value={formData.qrData}
            onChange={(e) => handleInputChange("qrData", e.target.value)}
            placeholder="URL or text for QR code"
          />
        </div>

        <div>
          <Label htmlFor="logo">Logo Upload</Label>
          <Input
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="cursor-pointer"
          />
        </div>
      </CardContent>
    </Card>
  );
};
