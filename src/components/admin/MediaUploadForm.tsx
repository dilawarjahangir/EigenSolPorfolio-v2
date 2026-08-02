"use client";

import { FileImage, ImageUp, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import adminStyles from "./AdminUi.module.css";
import styles from "./MediaUploadForm.module.css";

type UploadStatus = Readonly<{
  tone: "success" | "error";
  message: string;
}> | null;

type UploadResponse = Readonly<{
  ok?: boolean;
  duplicate?: boolean;
  error?: Readonly<{ message?: string }>;
}>;

async function readUploadResponse(response: Response): Promise<UploadResponse> {
  if (!response.headers.get("content-type")?.includes("application/json")) return {};

  try {
    return (await response.json()) as UploadResponse;
  } catch {
    return {};
  }
}

export function MediaUploadForm() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [status, setStatus] = useState<UploadStatus>(null);

  const submitUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setUploading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      if (response.redirected) {
        window.location.assign(response.url);
        return;
      }

      const result = await readUploadResponse(response);
      if (!response.ok) {
        setStatus({
          tone: "error",
          message: result.error?.message ?? "The image could not be uploaded. Try again.",
        });
        return;
      }

      form.reset();
      setSelectedFileName("");
      setStatus({
        tone: "success",
        message: result.duplicate
          ? "This image was already in the media library."
          : "Image uploaded and processed successfully.",
      });
      router.refresh();
    } catch {
      setStatus({ tone: "error", message: "The upload could not reach the server. Try again." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submitUpload} encType="multipart/form-data">
      <div className={styles.copy}>
        <h2>Upload an image</h2>
        <p>
          JPEG, PNG, WebP, or AVIF; up to 10 MB and 6000 × 6000 pixels. Images are
          cleaned, resized, and stored as WebP.
        </p>
      </div>

      <label className={styles.fileField} htmlFor="media-file">
        <span className={styles.fileIcon} aria-hidden="true">
          <FileImage />
        </span>
        <span className={styles.fileCopy}>
          <strong>{selectedFileName || "Choose an image to upload"}</strong>
          <small id="media-file-help">
            JPEG, PNG, WebP, or AVIF · up to 10 MB
          </small>
        </span>
        <input
          className={styles.fileInput}
          id="media-file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          aria-describedby="media-file-help"
          disabled={uploading}
          required
          onChange={(event) => setSelectedFileName(event.target.files?.[0]?.name ?? "")}
        />
      </label>

      <button className={adminStyles.button} type="submit" disabled={uploading}>
        {uploading ? <LoaderCircle aria-hidden="true" /> : <ImageUp aria-hidden="true" />}
        {uploading ? "Uploading…" : "Upload image"}
      </button>

      {status ? (
        <p
          className={status.tone === "success" ? styles.success : styles.error}
          role={status.tone === "error" ? "alert" : "status"}
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
