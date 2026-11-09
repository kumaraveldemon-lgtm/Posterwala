import React from "react";
import Link from "next/link";
import { Palette, ShieldCheck, Truck, Sparkles, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 pt-16 pb-12 text-sm text-muted-foreground">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Value props banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-border">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-base">Gallery-Grade 300 DPI</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Printed on 300 GSM archival velvet cardstock & genuine fuji crystal photo paper.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-600">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-base">Free Pan-India Delivery</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Shipped in crush-proof heavy kraft tubes and rigid stay-flat mailers on all orders over ₹499.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-base">Custom Studio & DPI Guard</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Live interactive resolution check ensures your memories never print blurry or pixelated.
              </p>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white font-bold">
                <Palette className="h-4 w-4" />
              </div>
              <span className="font-display font-bold text-foreground text-lg">POSTERWALA</span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs">
              Crafting premium visual aesthetics for spaces across India. Based in Mumbai & Bengaluru.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">
              Art Catalog
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/designs?category=minimal" className="hover:text-foreground">Minimalist Architecture</Link></li>
              <li><Link href="/designs?category=anime" className="hover:text-foreground">Anime & Manga Art</Link></li>
              <li><Link href="/designs?category=travel" className="hover:text-foreground">Retro Travel Posters</Link></li>
              <li><Link href="/designs?category=quotes" className="hover:text-foreground">Mindful Typography</Link></li>
              <li><Link href="/designs?category=abstract" className="hover:text-foreground">Contemporary Abstract</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">
              Custom Prints
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/custom?product=poster" className="hover:text-foreground">A4, A3, A2 Art Posters</Link></li>
              <li><Link href="/custom?product=polaroid-pack" className="hover:text-foreground">Vintage Polaroid Packs (12 / 24)</Link></li>
              <li><Link href="/custom?product=photo-print" className="hover:text-foreground">Archival Photo Prints</Link></li>
              <li><Link href="/custom" className="hover:text-foreground">Online Studio & DPI Tester</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">
              Customer Support
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/account" className="hover:text-foreground">Track Order Status</Link></li>
              <li><span className="text-muted-foreground">help@posterwala.com</span></li>
              <li><span className="text-muted-foreground">+91 98765 43210 (10 AM - 7 PM IST)</span></li>
              <li><span className="text-muted-foreground">GST Invoicing Available</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border pt-8 text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} Posterwala India. All rights reserved.</p>
          <div className="flex items-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-brand-500 fill-brand-500 mx-1" /> for Indian spaces and art lovers.
          </div>
        </div>
      </div>
    </footer>
  );
}
