"use client";

import { RequestFilters } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const TYPES = ["cra-request", "doc-request"];
const STEPS = ["completed", "failed", "in-progress", "pending", "cancelled"];
const COUNTRIES = ["HK", "SG", "MY"];

interface FilterBarProps {
  filters: RequestFilters;
  onChange: (filters: RequestFilters) => void;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const update = (patch: Partial<RequestFilters>) =>
    onChange({ ...filters, ...patch });

  const clear = () =>
    onChange({
      type: undefined,
      step: undefined,
      organization: undefined,
      countryCode: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Type */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Type
        </label>
        <Select
          value={filters.type ?? "all"}
          onValueChange={(v) => update({ type: !v || v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Step */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Status
        </label>
        <Select
          value={filters.step ?? "all"}
          onValueChange={(v) => update({ step: !v || v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STEPS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Country */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Country
        </label>
        <Select
          value={filters.countryCode ?? "all"}
          onValueChange={(v) =>
            update({ countryCode: !v || v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date From */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          From
        </label>
        <Input
          type="date"
          className="w-[150px]"
          value={filters.dateFrom ?? ""}
          onChange={(e) => update({ dateFrom: e.target.value || undefined })}
        />
      </div>

      {/* Date To */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">To</label>
        <Input
          type="date"
          className="w-[150px]"
          value={filters.dateTo ?? ""}
          onChange={(e) => update({ dateTo: e.target.value || undefined })}
        />
      </div>

      {/* Organization (free text) */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Organization
        </label>
        <Input
          placeholder="e.g. canary"
          className="w-[140px]"
          value={filters.organization ?? ""}
          onChange={(e) =>
            update({ organization: e.target.value || undefined })
          }
        />
      </div>

      <Button variant="ghost" size="sm" onClick={clear}>
        Clear
      </Button>
    </div>
  );
}
