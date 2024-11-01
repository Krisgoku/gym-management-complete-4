"use client";

import { useCallback } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadButtonProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: Error) => void;
}

export function UploadButton({ onUploadComplete, onUploadError }: UploadButtonProps) {
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        onUploadComplete(res[0].url);
      }
    },
    onUploadError: (error) => {
      onUploadError(error);
    },
  });

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await startUpload([file]);
      }
    },
    [startUpload]
  );

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => document.getElementById("image-upload")?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Photo
      </Button>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}