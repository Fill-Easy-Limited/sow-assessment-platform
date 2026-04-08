"use client";

import { useCallback, useState } from "react";
import { uploadFileForRequest } from "@/lib/api";
import type { Step } from "@/lib/types";

interface FileUploadProps {
	requestId: string;
	step: Step;
  stage: string;
	uploadUrl?: string;
  onSuccess?: () => Promise<void> | void;
}

export default function FileUpload({
	requestId,
	step,
  stage,
	uploadUrl,
  onSuccess,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

	const canUpload = step === "manual" && Boolean(uploadUrl);

  const stageFile = useCallback((file: File) => {
		if (step !== "manual") {
			setStatus("error");
			setMessage("File upload is only available when request step is manual.");
			return;
		}

		if (!uploadUrl) {
			setStatus("error");
			setMessage("No uploadUrl available for this request.");
			return;
		}

    setSelectedFile(file);
    setStatus("idle");
    setMessage(`Ready to upload: ${file.name}`);
  }, [step, uploadUrl]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setStatus("error");
      setMessage("Please choose a file first.");
      return;
    }

    setStatus("uploading");
    setMessage(`Uploading ${selectedFile.name} for ${requestId}...`);
    try {
      const result = await uploadFileForRequest(requestId, selectedFile, stage);
      setStatus("success");
      setMessage(`Uploaded successfully (${result.status}).`);
      setSelectedFile(null);
		  onSuccess?.();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Upload failed");
    }
  }, [onSuccess, requestId, selectedFile, stage]);

	const onDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDragOver(false);
			const file = e.dataTransfer.files[0];
			if (file) stageFile(file);
		},
		[stageFile],
	);

	const onFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) stageFile(file);
		},
		[stageFile],
	);

  return (
    <div
      onDragOver={(e) => {
        if (!canUpload) return;
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
        {canUpload
          ? "Drag & drop a file here, or click to browse"
          : "Upload is available only when the request is in manual step and uploadUrl is present"}
      </p>
		<label
			className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
				canUpload
					? "cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
					: "cursor-not-allowed bg-muted text-muted-foreground"
			}`}
		>
        Choose file
        <input
          type="file"
          className="hidden"
          onChange={onFileSelect}
          disabled={!canUpload}
        />
      </label>

      {selectedFile && (
        <p className="mt-3 text-sm text-muted-foreground">
          Selected: {selectedFile.name}
        </p>
      )}

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!canUpload || !selectedFile || status === "uploading"}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            !canUpload || !selectedFile || status === "uploading"
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {status === "uploading" ? "Uploading..." : "Upload"}
        </button>
        {selectedFile && status !== "uploading" && (
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setStatus("idle");
              setMessage("");
            }}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Clear
          </button>
        )}
      </div>

      {message && (
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
