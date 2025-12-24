import { useState, useRef, useCallback } from "react";
import { Upload, X, FileIcon, ImageIcon, File, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface FileUploadConfig {
  maxFileSize?: number;
  acceptedTypes?: string[];
  acceptedExtensions?: string[];
  maxDimensions?: { width: number; height: number };
  enableCompression?: boolean;
  compressionQuality?: number;
}

export interface UploadedFile {
  id?: string;
  file: File;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  analysis?: string;
}

interface FileUploadProps {
  onFileSelect: (file: File, preview?: string) => void;
  onUpload?: (file: File) => Promise<any>;
  onRemove?: () => void;
  config?: FileUploadConfig;
  currentFile?: File | null;
  currentPreview?: string | null;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

const DEFAULT_CONFIG: FileUploadConfig = {
  maxFileSize: 10 * 1024 * 1024,
  acceptedTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  acceptedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".txt", ".doc", ".docx"],
  maxDimensions: { width: 4096, height: 4096 },
  enableCompression: true,
  compressionQuality: 0.8,
};

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .substring(0, 100);
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : "";
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function compressImage(
  file: File,
  quality: number,
  maxWidth: number,
  maxHeight: number
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const dataUrl = canvas.toDataURL(file.type, quality);
            resolve({ blob, dataUrl });
          } else {
            reject(new Error("Failed to compress image"));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

async function validateImageDimensions(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<{ valid: boolean; width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        valid: img.width <= maxWidth && img.height <= maxHeight,
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => resolve({ valid: false, width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
}

export function FileUpload({
  onFileSelect,
  onUpload,
  onRemove,
  config = {},
  currentFile,
  currentPreview,
  disabled = false,
  className,
  compact = false,
}: FileUploadProps) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "validating" | "compressing" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    async (file: File): Promise<{ valid: boolean; error?: string }> => {
      const extension = getFileExtension(file.name);
      if (
        mergedConfig.acceptedExtensions &&
        !mergedConfig.acceptedExtensions.includes(extension)
      ) {
        return {
          valid: false,
          error: `File type ${extension} not supported. Accepted: ${mergedConfig.acceptedExtensions.join(", ")}`,
        };
      }

      if (mergedConfig.acceptedTypes && !mergedConfig.acceptedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `MIME type ${file.type} not supported`,
        };
      }

      if (mergedConfig.maxFileSize && file.size > mergedConfig.maxFileSize) {
        return {
          valid: false,
          error: `File too large. Maximum size: ${formatFileSize(mergedConfig.maxFileSize)}`,
        };
      }

      if (file.type.startsWith("image/") && mergedConfig.maxDimensions) {
        const dimensions = await validateImageDimensions(
          file,
          mergedConfig.maxDimensions.width,
          mergedConfig.maxDimensions.height
        );
        if (!dimensions.valid) {
          return {
            valid: false,
            error: `Image dimensions (${dimensions.width}x${dimensions.height}) exceed maximum (${mergedConfig.maxDimensions.width}x${mergedConfig.maxDimensions.height})`,
          };
        }
      }

      return { valid: true };
    },
    [mergedConfig]
  );

  const processFile = useCallback(
    async (file: File) => {
      setErrorMessage(null);
      setUploadStatus("validating");
      setUploadProgress(10);

      const validation = await validateFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error || "Invalid file");
        setUploadStatus("error");
        return;
      }

      setUploadProgress(30);
      let processedFile = file;
      let preview: string | undefined;

      if (
        file.type.startsWith("image/") &&
        mergedConfig.enableCompression &&
        mergedConfig.maxDimensions
      ) {
        setUploadStatus("compressing");
        try {
          const compressed = await compressImage(
            file,
            mergedConfig.compressionQuality || 0.8,
            mergedConfig.maxDimensions.width,
            mergedConfig.maxDimensions.height
          );
          const newFile = new globalThis.File(
            [compressed.blob], 
            sanitizeFileName(file.name), 
            { type: file.type }
          );
          processedFile = newFile;
          preview = compressed.dataUrl;
          setUploadProgress(60);
        } catch (err) {
          console.error("Compression failed, using original:", err);
          const reader = new FileReader();
          preview = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }
      } else if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        preview = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        setUploadProgress(60);
      } else {
        setUploadProgress(60);
      }

      setUploadStatus("success");
      setUploadProgress(100);
      onFileSelect(processedFile, preview);
    },
    [validateFile, mergedConfig, onFileSelect]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [disabled, processFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFile]
  );

  const handleRemove = useCallback(() => {
    setUploadStatus("idle");
    setUploadProgress(0);
    setErrorMessage(null);
    onRemove?.();
  }, [onRemove]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  if (compact) {
    return (
      <div className={cn("relative", className)}>
        <input
          ref={fileInputRef}
          type="file"
          accept={mergedConfig.acceptedTypes?.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          data-testid="input-file-upload"
        />
        
        {currentFile ? (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            {currentPreview ? (
              <img
                src={currentPreview}
                alt="Preview"
                className="h-10 w-10 object-cover rounded"
              />
            ) : (
              <FileIcon className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(currentFile.size)}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleRemove}
              disabled={disabled}
              data-testid="button-remove-file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={disabled}
            className="touch-target"
            data-testid="button-attach-file"
          >
            <Upload className="h-5 w-5" />
          </Button>
        )}

        {errorMessage && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-destructive/10 text-destructive text-xs rounded-md flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errorMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          "flex flex-col items-center justify-center gap-4",
          "min-h-[200px]",
          isDragging && "border-primary bg-primary/5",
          !isDragging && "border-border hover:border-primary/50 hover:bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed",
          errorMessage && "border-destructive"
        )}
        data-testid="dropzone-file-upload"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={mergedConfig.acceptedTypes?.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          data-testid="input-file-upload-hidden"
        />

        {currentFile ? (
          <div className="flex flex-col items-center gap-3 w-full">
            {currentPreview ? (
              <img
                src={currentPreview}
                alt="Preview"
                className="max-h-32 max-w-full object-contain rounded-lg"
              />
            ) : (
              <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                <File className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div className="text-center">
              <p className="font-medium text-sm">{currentFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(currentFile.size)}
              </p>
            </div>
            {uploadStatus === "success" && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Ready to send
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              disabled={disabled}
              data-testid="button-remove-file-large"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <>
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              {uploadStatus === "validating" || uploadStatus === "compressing" ? (
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <p className="font-medium">
                {isDragging ? "Drop file here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {mergedConfig.acceptedExtensions?.join(", ")} up to{" "}
                {formatFileSize(mergedConfig.maxFileSize || 0)}
              </p>
            </div>
          </>
        )}

        {(uploadStatus === "validating" || uploadStatus === "compressing" || uploadStatus === "uploading") && (
          <div className="w-full max-w-xs">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground mt-1">
              {uploadStatus === "validating" && "Validating..."}
              {uploadStatus === "compressing" && "Optimizing image..."}
              {uploadStatus === "uploading" && "Uploading..."}
            </p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export function FileUploadButton({
  onFileSelect,
  config = {},
  disabled = false,
  children,
  className,
}: {
  onFileSelect: (file: File, preview?: string) => void;
  config?: FileUploadConfig;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const extension = getFileExtension(file.name);
      if (
        mergedConfig.acceptedExtensions &&
        !mergedConfig.acceptedExtensions.includes(extension)
      ) {
        throw new Error(`File type ${extension} not supported`);
      }

      if (mergedConfig.maxFileSize && file.size > mergedConfig.maxFileSize) {
        throw new Error(`File too large (max ${formatFileSize(mergedConfig.maxFileSize)})`);
      }

      let preview: string | undefined;
      if (file.type.startsWith("image/")) {
        if (mergedConfig.enableCompression && mergedConfig.maxDimensions) {
          const compressed = await compressImage(
            file,
            mergedConfig.compressionQuality || 0.8,
            mergedConfig.maxDimensions.width,
            mergedConfig.maxDimensions.height
          );
          preview = compressed.dataUrl;
        } else {
          const reader = new FileReader();
          preview = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }
      }

      onFileSelect(file, preview);
    } catch (err) {
      console.error("File processing error:", err);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={mergedConfig.acceptedTypes?.join(",")}
        onChange={handleChange}
        className="hidden"
        disabled={disabled || isProcessing}
        data-testid="input-file-button"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isProcessing}
        className={cn("touch-target", className)}
        data-testid="button-file-upload"
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : children ? (
          children
        ) : (
          <ImageIcon className="h-5 w-5" />
        )}
      </Button>
    </>
  );
}
