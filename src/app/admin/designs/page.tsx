"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MOCK_DESIGNS } from "@/lib/mock-data";
import { Design } from "@/types/database.types";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminDesignsListPage() {
  const [designs, setDesigns] = useState<Design[]>(MOCK_DESIGNS);
  const [search, setSearch] = useState("");

  const filtered = designs.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setDesigns((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_active: !d.is_active } : d))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display tracking-tight text-foreground">
            Curated Catalog Designs
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage admin-uploaded master designs, prices, and status.
          </p>
        </div>

        <Link href="/admin/designs/new">
          <Button className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Upload New Design
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search designs by title or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-xl"
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Total {filtered.length} designs
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-y border-border">
                <tr>
                  <th className="py-3 px-6">Artwork</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Starting Price</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((design) => (
                  <tr key={design.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-11 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                          <Image
                            src={design.thumbnail_storage_path || design.watermark_storage_path}
                            alt={design.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{design.title}</p>
                          <p className="text-xs text-muted-foreground">/{design.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <Badge variant="outline" className="rounded-lg">
                        {design.category?.name || "Art"}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 font-semibold">
                      {formatINR(design.starting_price)}
                    </td>

                    <td className="py-4 px-6">
                      {design.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                          <XCircle className="h-3.5 w-3.5" />
                          Draft
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => toggleStatus(design.id)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg border border-border hover:bg-muted"
                      >
                        {design.is_active ? "Make Inactive" : "Make Active"}
                      </button>

                      <Link
                        href={`/designs/${design.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 px-2.5 py-1 rounded-lg border border-brand-500/30 bg-brand-500/5 hover:bg-brand-500/10"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Live
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
