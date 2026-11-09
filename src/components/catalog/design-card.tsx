"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Design } from "@/types/database.types";
import { formatINR } from "@/lib/utils";
import { Sparkles, ArrowUpRight } from "lucide-react";

interface DesignCardProps {
  design: Design;
}

export function DesignCard({ design }: DesignCardProps) {
  return (
    <Link
      href={`/designs/${design.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-poster hover:border-brand-500/40"
    >
      {/* Visual Canvas Area */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted/60">
        <Image
          src={design.thumbnail_storage_path || design.watermark_storage_path}
          alt={design.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category tag */}
        {design.category && (
          <div className="absolute top-3 left-3">
            <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white/90 uppercase tracking-wider shadow-sm">
              {design.category.name}
            </span>
          </div>
        )}

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="flex items-center gap-1.5 text-white font-medium text-xs bg-brand-600/90 backdrop-blur-md py-1.5 px-3 rounded-xl shadow-lg">
            <Sparkles className="h-3.5 w-3.5" />
            Customize & Buy
            <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Details Footer */}
      <div className="flex flex-col p-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-base text-foreground group-hover:text-brand-600 transition-colors line-clamp-1">
            {design.title}
          </h3>
        </div>

        <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-border/60">
          <span className="text-xs text-muted-foreground font-medium">Starting from</span>
          <span className="font-bold text-base text-foreground group-hover:text-brand-600 transition-colors">
            {formatINR(design.starting_price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
