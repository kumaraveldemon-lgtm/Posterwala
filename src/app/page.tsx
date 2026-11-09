import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MOCK_CATEGORIES, MOCK_DESIGNS } from "@/lib/mock-data";
import { DesignCard } from "@/components/catalog/design-card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Truck,
  CheckCircle2,
  Camera,
} from "lucide-react";

export default function HomePage() {
  const featuredDesigns = MOCK_DESIGNS.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-24 bg-gradient-to-b from-brand-500/5 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-brand-600 animate-pulse" />
                <span>Museum-Grade Printing Studio in India</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-foreground leading-[1.08]">
                Turn Every Wall into an{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500">
                  Exhibition.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Archival matte posters, vintage polaroids, and fine photo prints crafted with 300 DPI precision on 300 GSM cardstock.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/designs" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-2xl h-14 px-8 text-base shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 group"
                  >
                    Explore Art Catalog
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <Link href="/custom" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-border/80 bg-card hover:bg-accent font-medium rounded-2xl h-14 px-8 text-base flex items-center justify-center gap-2"
                  >
                    <Camera className="h-4 w-4 text-brand-500" />
                    Print Custom Photos
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-border/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  300 DPI Guaranteed
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  3mm Bleed Precision
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Free Shipping above ₹499
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Multi-Mockup Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                {/* Glow Backdrop */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-brand-500/20 to-amber-500/20 blur-2xl opacity-70" />

                {/* Main Framed Poster Mockup */}
                <div className="relative z-10 rounded-2xl bg-white p-3 sm:p-4 shadow-2xl frame-wood transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-neutral-100">
                    <Image
                      src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80"
                      alt="Kyoto Solitude framed art print"
                      fill
                      priority
                      className="object-cover"
                    />
                  </div>
                  <div className="pt-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-neutral-900">Kyoto Solitude</p>
                      <p className="text-neutral-500">A3 Archival Matte</p>
                    </div>
                    <span className="font-bold text-brand-600 bg-brand-500/10 px-2.5 py-1 rounded-full">
                      ₹499
                    </span>
                  </div>
                </div>

                {/* Floating Polaroid Pack Card */}
                <div className="absolute -bottom-8 -left-6 z-20 w-44 sm:w-48 rounded-xl bg-white p-2.5 pb-6 polaroid-shadow transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="relative aspect-square w-full overflow-hidden rounded-md bg-neutral-200">
                    <Image
                      src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80"
                      alt="Polaroid pack print"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 text-center font-display font-medium text-[11px] text-neutral-800">
                    Summer in Amalfi &apos;24
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE CATEGORIES */}
      <section className="py-16 sm:py-24 border-t border-border/80">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase font-bold text-brand-600 tracking-wider">
                Find Your Aesthetic
              </span>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-foreground mt-1">
                Explore Art Collections
              </h2>
            </div>
            <Link
              href="/designs"
              className="mt-4 sm:mt-0 text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
            >
              Browse all collections
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {MOCK_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/designs?category=${cat.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  <Image
                    src={cat.image_url || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80"}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-display font-bold text-lg leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED DESIGNS */}
      <section className="py-16 sm:py-24 bg-card/40 border-t border-border/80">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase font-bold text-brand-600 tracking-wider">
                Editor&apos;s Picks
              </span>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-foreground mt-1">
                Trending Prints This Week
              </h2>
            </div>
            <Link
              href="/designs"
              className="mt-4 sm:mt-0 text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
            >
              View Full Gallery
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredDesigns.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW POSTERWALA WORKS */}
      <section className="py-20 sm:py-28 border-t border-border/80 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold text-brand-600 tracking-wider">
              The Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-foreground mt-1">
              How Posterwala Works
            </h2>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base">
              From high-res digital pixels to tangible gallery art on your wall in 4 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 font-bold mb-5 font-display text-lg">
                01
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">
                Pick or Upload
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Choose from our curated artists catalog or upload your custom phone photos, digital art, or memories up to 25 MB.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 font-bold mb-5 font-display text-lg">
                02
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">
                Live Studio & DPI Guard
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Preview in room frames, crop, add custom text, apply vintage & B&W filters with our automatic 150 DPI resolution guard.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 font-bold mb-5 font-display text-lg">
                03
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">
                300 DPI Archival Print
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We print on 300 GSM velvet cardstock with 3 mm full bleed, anti-fade pigmented inks, and your choice of matte or glossy finish.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 font-bold mb-5 font-display text-lg">
                04
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">
                Pan-India Delivery
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Dispatched in reinforced crush-proof kraft tubes and rigid flat mailers. Track order updates via live SMS and email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CUSTOM STUDIO CALLOUT BANNER */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-semibold">
                <Camera className="h-3.5 w-3.5" />
                Custom Print Studio
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-tight">
                Have a favorite photograph or artwork? Turn it into a tangible print.
              </h2>
              <p className="text-neutral-400 text-base max-w-2xl leading-relaxed">
                Upload your images, preview live inside wall frames, apply vintage polaroid styling, and verify resolution quality before printing.
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link href="/custom">
                <Button
                  size="lg"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-semibold h-14 px-8 rounded-2xl text-base shadow-xl shadow-brand-500/30"
                >
                  Start Custom Studio
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
