"use client";

import { useCallback, useState } from "react";
import { uploadFile } from "@/lib/api";

export default function FileUpload() {
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleFile = useCallback(async (file: File) => {
    setStatus("uploading");
    setMessage(`Uploading ${file.name}...`);
    try {
      const result = await uploadFile(file);
      setStatus("success");
      setMessage(`Uploaded: ${result.url}`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Upload failed");
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-border/60"
      }`}
    >
      <p className="text-sm text-muted-foreground mb-3">
        Drag & drop a file here, or click to browse
      </p>
      <label className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        Choose file
        <input
          type="file"
          className="hidden"
          onChange={onFileSelect}
        />
      </label>

      {status !== "idle" && (
        <p
          className={`mt-4 text-sm ${
            status === "error"
              ? "text-red-600"
              : status === "success"
                ? "text-green-600"
                : "text-muted-foreground"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
