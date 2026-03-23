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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Country / Organization</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[220px]">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !USE_MOCK ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((r) => (
                <TableRow
                  key={r.requestId}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelected(r)}
                >
                  <TableCell className="font-mono text-xs">
                    {r.requestId}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{r.countryCode}</span>
                    <span className="text-muted-foreground"> / {r.organization}</span>
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
