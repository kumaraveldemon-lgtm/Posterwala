"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
  UploadCloud,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Eye,
  Lock,
} from "lucide-react";
import Link from "next/link";

export default function AdminNewDesignPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("c1");
  const [tags, setTags] = useState("");
  const [startingPrice, setStartingPrice] = useState(299);
  const [isActive, setIsActive] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Result from Sharp processing
  const [uploadResult, setUploadResult] = useState<{
    thumbnail: string;
    watermark: string;
    slug: string;
  } | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File exceeds 25 MB limit");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please select a high-resolution JPG, PNG or WebP file");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please upload a high-resolution image");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("description", description);
      formData.append("categoryId", categoryId);
      formData.append("tags", tags);
      formData.append("startingPrice", startingPrice.toString());
      formData.append("isActive", isActive.toString());
      formData.append("image", selectedFile);

      const res = await fetch("/api/admin/designs/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success("Design successfully processed and published with Sharp!");
      setUploadResult({
        thumbnail: data.design.thumbnail_storage_path,
        watermark: data.design.watermark_storage_path,
        slug: data.design.slug,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload design");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/designs"
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Designs List
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-black font-display tracking-tight text-foreground">
          Upload New Curated Design
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          High-res master images will be stored securely. Sharp will automatically generate a public watermarked preview and a 600px thumbnail.
        </p>
      </div>

      {uploadResult ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
              <CardTitle className="text-xl">Design Successfully Published!</CardTitle>
            </div>
            <CardDescription>
              Sharp generated public watermarked previews and kept the master original in private storage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  Watermarked Public Preview (1600px)
                </span>
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-neutral-900 border border-border">
                  <Image
                    src={uploadResult.watermark}
                    alt="Watermark Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Catalog Thumbnail (600px)
                </span>
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-neutral-900 border border-border">
                  <Image
                    src={uploadResult.thumbnail}
                    alt="Thumbnail Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href={`/designs/${uploadResult.slug}`} target="_blank">
                <Button className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl">
                  View Live in Public Shop
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadResult(null);
                  setTitle("");
                  setSlug("");
                  setDescription("");
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="rounded-xl"
              >
                Upload Another Artwork
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left: Image File Dropzone */}
            <div className="md:col-span-5 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Master High-Resolution Image (Private)
              </label>

              <div
                className={`relative aspect-[3/4] w-full rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center overflow-hidden ${
                  previewUrl
                    ? "border-brand-500/50 bg-background"
                    : "border-border hover:border-brand-500/50 bg-card/60"
                }`}
              >
                {previewUrl ? (
                  <>
                    <Image
                      src={previewUrl}
                      alt="Upload Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="rounded-xl"
                      >
                        Change Image
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-14 w-14 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center mb-3">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <p className="font-semibold text-sm">Upload High-Res Master</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                      JPG, PNG, or WebP up to 25 MB. 300 DPI recommended.
                    </p>
                    <label className="mt-4 cursor-pointer">
                      <span className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90">
                        Select File
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-border/80 bg-card p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  High-res master is locked in private bucket &apos;secure-originals&apos;. Customers only see watermarked previews until purchased.
                </span>
              </div>
            </div>

            {/* Right: Meta Details Form */}
            <div className="md:col-span-7 space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Design Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Artwork Title *
                    </label>
                    <Input
                      placeholder="e.g. Kyoto Solitude"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      URL Slug *
                    </label>
                    <Input
                      placeholder="e.g. kyoto-solitude"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Category *
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {MOCK_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Starting Price (INR) *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="299"
                        value={startingPrice}
                        onChange={(e) => setStartingPrice(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Tags (comma-separated)
                    </label>
                    <Input
                      placeholder="minimal, architecture, japan, modern"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell customers about the inspiration, colors, and ideal room setting..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <p className="font-semibold text-sm">Active & Visible in Catalog</p>
                      <p className="text-xs text-muted-foreground">
                        Toggle off to save as private draft
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-5 w-5 rounded border-border text-brand-500 focus:ring-brand-500 cursor-pointer"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={isUploading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold h-12 rounded-xl text-base shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    Processing with Sharp (Watermarking & Thumbnails)...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-5 w-5" />
                    Process & Publish Artwork
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
