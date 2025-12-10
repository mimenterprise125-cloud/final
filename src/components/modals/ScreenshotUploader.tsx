import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ScreenshotFile {
  id: string;
  file: File;
  preview: string;
  isUploading?: boolean;
  error?: string;
}

interface ScreenshotUploaderProps {
  screenshots: ScreenshotFile[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  maxSize?: number; // in bytes, default 10MB
  maxFiles?: number; // default 5
  disabled?: boolean;
}

export function ScreenshotUploader({
  screenshots,
  onAdd,
  onRemove,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  disabled = false,
}: ScreenshotUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const canAddMore = screenshots.length < maxFiles;

  const validateFiles = (files: File[]): File[] => {
    return files.filter((file) => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        console.warn(`${file.name} is not an image`);
        return false;
      }
      // Check file size
      if (file.size > maxSize) {
        console.warn(`${file.name} exceeds size limit`);
        return false;
      }
      return true;
    });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || !canAddMore) return;

    const fileArray = Array.from(files);
    const validFiles = validateFiles(fileArray);

    if (validFiles.length > 0) {
      onAdd(validFiles);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          📸 Trade Screenshots
        </label>
        <span className="text-xs text-muted-foreground">
          {screenshots.length}/{maxFiles}
        </span>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer ${
          dragActive
            ? "border-accent bg-accent/10"
            : "border-border/50 bg-background/50 hover:border-accent/50"
        } ${disabled || !canAddMore ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled || !canAddMore}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || !canAddMore}
          className="w-full text-center"
        >
          <Upload size={20} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG up to {(maxSize / 1024 / 1024).toFixed(0)}MB
          </p>
        </button>
      </div>

      {/* Screenshot Preview Grid */}
      <AnimatePresence>
        {screenshots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {screenshots.map((screenshot) => (
              <motion.div
                key={screenshot.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-background/50 border border-border/50">
                  <img
                    src={screenshot.preview}
                    alt="Screenshot preview"
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => onRemove(screenshot.id)}
                      className="bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                      title="Remove screenshot"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Loading or error indicator */}
                  {screenshot.isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    </div>
                  )}

                  {screenshot.error && (
                    <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center p-2">
                      <p className="text-white text-xs text-center">
                        {screenshot.error}
                      </p>
                    </div>
                  )}
                </div>

                {/* File name tooltip */}
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {screenshot.file.name}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Text */}
      {canAddMore && (
        <p className="text-xs text-muted-foreground">
          💡 Add screenshots of your trade setup, entry, and exit points
        </p>
      )}

      {!canAddMore && (
        <p className="text-xs text-orange-500">
          ⚠️ Maximum {maxFiles} screenshots allowed
        </p>
      )}
    </div>
  );
}
