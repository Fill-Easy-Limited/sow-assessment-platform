"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRequests } from "@/lib/api";
import { MOCK_REQUESTS } from "@/lib/mock-data";
import { RequestItem, RequestFilters } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProgressBar from "./progress-bar";
import FilterBar from "./filter-bar";
import RequestDetail from "./request-detail";
import { format } from "date-fns";

const USE_MOCK = !process.env.NEXT_PUBLIC_API_URL;

export default function Dashboard() {
  const [filters, setFilters] = useState<RequestFilters>({});
  const [selected, setSelected] = useState<RequestItem | null>(null);

  const { data: apiData, isLoading } = useQuery({
    queryKey: ["requests", filters],
    queryFn: () => getRequests(filters),
    enabled: !USE_MOCK,
  });

  // Apply filters client-side for mock data
  const requests = useMemo(() => {
    const source = USE_MOCK ? MOCK_REQUESTS : apiData ?? [];
    return source.filter((r) => {
      if (filters.type && r.type !== filters.type) return false;
      if (filters.step && r.step !== filters.step) return false;
      if (
        filters.organization &&
        !r.organization.toLowerCase().includes(filters.organization.toLowerCase())
      )
        return false;
      if (filters.countryCode && r.countryCode !== filters.countryCode)
        return false;
      if (filters.dateFrom && r.startedAt < filters.dateFrom) return false;
      if (filters.dateTo && r.startedAt > filters.dateTo + "T23:59:59.999Z")
        return false;
      return true;
    });
  }, [apiData, filters]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Request ID</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Country / Organization</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[220px]">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !USE_MOCK ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-12 text-muted-foreground"
                >
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((r) => (
                <TableRow
                  key={r.requestId}
                  className="cursor-pointer transition-colors hover:bg-accent/50 border-border/40"
                  onClick={() => setSelected(r)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {r.requestId}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-xs font-semibold bg-primary/15 text-primary-foreground/80 px-1.5 py-0.5 rounded">{r.countryCode}</span>
                      <span className="text-sm text-foreground/70">{r.organization}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(r.startedAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <ProgressBar step={r.step} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail modal */}
      <RequestDetail
        item={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
