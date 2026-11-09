"use client";

import React, { useState, useMemo } from "react";
import { MOCK_DESIGNS, MOCK_CATEGORIES } from "@/lib/mock-data";
import { DesignCard } from "@/components/catalog/design-card";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");

  const categories = useMemo(() => {
    return [{ id: "all", name: "All Designs", slug: "all" }, ...MOCK_CATEGORIES];
  }, []);

  const filteredDesigns = useMemo(() => {
    let result = [...MOCK_DESIGNS];

    // Filter by Category
    if (selectedCategory !== "all") {
      result = result.filter(
        (d) =>
          d.category?.slug.toLowerCase() === selectedCategory.toLowerCase() ||
          d.category_id?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.starting_price - b.starting_price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.starting_price - a.starting_price);
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen py-10 pb-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Curated Collections
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-foreground">
            Art Prints & Posters
          </h1>
          <p className="text-muted-foreground mt-3 text-base sm:text-lg leading-relaxed">
            Discover limited edition archival prints across Minimalist, Anime, Vintage Travel, Quotes, and Abstract styles.
          </p>
        </div>

        {/* Controls: Search, Filters & Sort */}
        <div className="space-y-4 mb-10">
          {/* Search bar & Sort dropdown */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search art by title, artist, or tags (e.g. Kyoto, Bauhaus)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-2xl bg-card border-border/80 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 whitespace-nowrap">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-12 rounded-2xl border border-border/80 bg-card px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shadow-sm ${
                    active
                      ? "bg-brand-500 text-white shadow-brand-500/25 scale-[1.02]"
                      : "bg-card text-foreground hover:bg-muted border border-border/80"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-6 font-medium">
          <span>Showing {filteredDesigns.length} prints</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-brand-600 hover:underline"
            >
              Clear search &quot;{searchQuery}&quot;
            </button>
          )}
        </div>

        {/* Designs Grid */}
        {filteredDesigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDesigns.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/40 my-8">
            <h3 className="font-display font-bold text-xl text-foreground">No art found</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2">
              We couldn&apos;t find any designs matching &quot;{searchQuery}&quot;. Try exploring other categories or create your own custom print!
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-6 px-6 py-2.5 rounded-xl bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 transition-colors shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
