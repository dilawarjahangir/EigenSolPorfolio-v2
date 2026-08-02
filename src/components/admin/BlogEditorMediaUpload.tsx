"use client";

import { ImageUp, LoaderCircle } from "lucide-react";
import { useId, useRef, useState, type ChangeEvent } from "react";
import type { BlogMediaAsset } from "@/contracts/blog-cms";
import styles from "./BlogEditorMediaUpload.module.css";

type UploadResponse = Readonly<{
  ok?: boolean;
  asset?: BlogMediaAsset;
  duplicate?: boolean;
  error?: Readonly<{ message?: string }>;
}>;

type BlogEditorMediaUploadProps = Readonly<{
  onUploaded: (asset: BlogMediaAsset) => void;
  onUploadError?: (message: string) => void;
  compact?: boolean;
  buttonClassName?: string;
  iconOnly?: boolean;
  label?: string;
  uploadingLabel?: string;
  showStatus?: boolean;
}>;

async function readUploadResponse(response: Response): Promise<UploadResponse> {
  if (!response.headers.get("content-type")?.includes("application/json")) return {};
  try {
    return (await response.json()) as UploadResponse;
  } catch {
    return {};
  }
}

export function BlogEditorMediaUpload({
  onUploaded,
  onUploadError,
  compact = false,
  buttonClassName,
  iconOnly = false,
  label = "Upload image",
  uploadingLabel = "Uploading...",
  showStatus = true,
}: BlogEditorMediaUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<Readonly<{
    tone: "success" | "error";
    message: string;
  }> | null>(null);

  const uploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);
    setUploading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      const result = await readUploadResponse(response);
      if (!response.ok || !result.asset) {
        const message = result.error?.message ?? "The image could not be uploaded.";
        setStatus({
          tone: "error",
          message,
        });
        onUploadError?.(message);
        return;
      }

      onUploaded(result.asset);
      setStatus({
        tone: "success",
        message: result.duplicate ? "This image was already available." : "Image uploaded and ready to use.",
      });
    } catch {
      const message = "The upload could not reach the server.";
      setStatus({ tone: "error", message });
      onUploadError?.(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.root} data-compact={compact ? "true" : undefined}>
      <input
        ref={inputRef}
        className={styles.input}
        id={inputId}
        type="file"
        aria-label="Choose image to upload"
        accept="image/jpeg,image/png,image/webp,image/avif"
        disabled={uploading}
        onInput={(event) => event.stopPropagation()}
        onChange={uploadFile}
      />
      <button
        className={buttonClassName ? `${styles.button} ${buttonClassName}` : styles.button}
        type="button"
        aria-label={iconOnly ? label : undefined}
        title={iconOnly ? label : undefined}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? <LoaderCircle aria-hidden="true" /> : <ImageUp aria-hidden="true" />}
        {iconOnly ? (
          <span className={styles.srOnly}>{uploading ? uploadingLabel : label}</span>
        ) : uploading ? uploadingLabel : label}
      </button>
      {showStatus && status ? (
        <span
          className={styles.status}
          data-tone={status.tone}
          role={status.tone === "error" ? "alert" : "status"}
        >
          {status.message}
        </span>
      ) : null}
    </div>
  );
}

