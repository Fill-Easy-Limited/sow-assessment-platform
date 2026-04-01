"use client";

import { RequestItem } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "./status-badge";
import StatusChanger from "./status-changer";
import FileUpload from "./file-upload";
import { formatDistanceToNow, format } from "date-fns";

interface RequestDetailProps {
  item: RequestItem | null;
  open: boolean;
  onClose: () => void;
}

function formatDuration(ms: number): string {
  if (ms === 0) return "—";
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function RequestDetail({
  item,
  open,
  onClose,
}: RequestDetailProps) {
  if (!item) return null;

  const startedDate = new Date(item.startedAt);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm tracking-wide text-muted-foreground">
            {item.requestId}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mt-4">
          <Field label="Type" value={item.type} />
          <Field label="Status">
            <StatusBadge step={item.step} />
          </Field>
          <Field label="Organization" value={item.organization} />
          <Field label="Stage" value={item.deploymentStage} />
          <Field label="Environment" value={item.environment} />
          <Field label="Country" value={item.countryCode} />
          <Field label="Document Type" value={item.documentType} />
          <Field label="Company ID" value={item.companyId} />
          <Field label="Automated" value={item.automated ? "Yes" : "No"} />
          <Field label="Duration" value={formatDuration(item.duration)} />
          <Field
            label="Started At"
            value={`${format(startedDate, "yyyy-MM-dd HH:mm:ss")} (${formatDistanceToNow(startedDate, { addSuffix: true })})`}
          />
        </div>

        {/* Status Changer */}
        <Separator className="my-4" />
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Change status:</span>
          <StatusChanger requestId={item.requestId} currentStep={item.step} />
        </div>

        {/* Error section */}
        {item.error && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2 rounded-lg bg-red-50 p-4">
              <h4 className="text-sm font-semibold text-red-600">Error</h4>
              <p className="text-sm">
                <span className="text-muted-foreground">Step:</span>{" "}
                {item.error.step}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Message:</span>{" "}
                {item.error.message}
              </p>
              {item.error.stack && (
                <pre className="text-xs bg-red-100/50 p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                  {item.error.stack}
                </pre>
              )}
            </div>
          </>
        )}

        {/* Debug URL */}
        {item.debugUrl && (
          <>
            <Separator className="my-4" />
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Debug Screenshot</h4>
              <a
                href={item.debugUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {item.debugUrl}
              </a>
            </div>
          </>
        )}

        {/* File Upload */}
        <Separator className="my-4" />
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Upload File</h4>
          <FileUpload />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="font-medium mt-0.5">{children ?? value}</div>
    </div>
  );
}
