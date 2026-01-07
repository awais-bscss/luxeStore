"use client";

import React, { useState, useRef } from "react";
import { Plus, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadImage, UploadedImage } from "../../utils/uploadUtils";

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label: string;
  maxImages?: number;
}

export default function MultiImageUpload({
  values,
  onChange,
  label,
  maxImages = 15,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed max
    if (values.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert("Please select only image files");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Each image must be less than 5MB");
        return;
      }
    }

    setIsUploading(true);

    try {
      // Upload all files
      const uploadPromises = files.map((file) => uploadImage(file));
      const results: UploadedImage[] = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.url);

      onChange([...values, ...newUrls]);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload images");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Existing images */}
        {values.map((url, index) => (
          <div key={index} className="relative group">
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload button */}
        {values.length < maxImages && (
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Uploading...
                </p>
              </>
            ) : (
              <>
                <Plus className="w-8 h-8 text-gray-400 mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Add Image
                </p>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
        {values.length} / {maxImages} images uploaded
      </p>
    </div>
  );
}
