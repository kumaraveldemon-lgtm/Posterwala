import { Design, Category, Product, ProductSize } from "@/types/database.types";
import { MOCK_DESIGNS, MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_PRODUCT_SIZES } from "@/lib/mock-data";
import { createClient as createServerClient } from "@/lib/supabase/server";

export interface DesignFilterParams {
  category?: string;
  search?: string;
  sort?: "newest" | "price-asc" | "price-desc";
}

export async function getDesigns(filters: DesignFilterParams = {}): Promise<Design[]> {
  try {
    const supabase = createServerClient();
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://mock");

    let designs: Design[] = [];

    if (!isMock) {
      let query = supabase
        .from("designs")
        .select("*, category:categories(*)")
        .eq("is_active", true);

      if (filters.sort === "price-asc") {
        query = query.order("starting_price", { ascending: true });
      } else if (filters.sort === "price-desc") {
        query = query.order("starting_price", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        designs = data as Design[];
      } else {
        designs = [...MOCK_DESIGNS];
      }
    } else {
      designs = [...MOCK_DESIGNS];
    }

    // Filter by category
    if (filters.category && filters.category !== "all") {
      designs = designs.filter(
        (d) =>
          d.category?.slug.toLowerCase() === filters.category?.toLowerCase() ||
          d.category_id?.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    // Filter by search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      designs = designs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort if not handled by Supabase
    if (filters.sort === "price-asc") {
      designs.sort((a, b) => a.starting_price - b.starting_price);
    } else if (filters.sort === "price-desc") {
      designs.sort((a, b) => b.starting_price - a.starting_price);
    } else if (filters.sort === "newest") {
      designs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return designs;
  } catch (err) {
    console.warn("Design service fallback to mock data:", err);
    return MOCK_DESIGNS;
  }
}

export async function getDesignBySlug(slug: string): Promise<Design | null> {
  try {
    const supabase = createServerClient();
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://mock");

    if (!isMock) {
      const { data, error } = await supabase
        .from("designs")
        .select("*, category:categories(*)")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (!error && data) {
        return data as Design;
      }
    }

    const found = MOCK_DESIGNS.find((d) => d.slug === slug);
    return found || null;
  } catch {
    return MOCK_DESIGNS.find((d) => d.slug === slug) || null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createServerClient();
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://mock");

    if (!isMock) {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Category[];
      }
    }
    return MOCK_CATEGORIES;
  } catch {
    return MOCK_CATEGORIES;
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = createServerClient();
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://mock");

    if (!isMock) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    }
    return MOCK_PRODUCTS;
  } catch {
    return MOCK_PRODUCTS;
  }
}

export async function getProductSizes(productId?: string): Promise<ProductSize[]> {
  try {
    const supabase = createServerClient();
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://mock");

    if (!isMock) {
      let query = supabase
        .from("product_sizes")
        .select("*")
        .order("sort_order", { ascending: true });

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as ProductSize[];
      }
    }

    if (productId) {
      return MOCK_PRODUCT_SIZES.filter((s) => s.product_id === productId);
    }
    return MOCK_PRODUCT_SIZES;
  } catch {
    if (productId) {
      return MOCK_PRODUCT_SIZES.filter((s) => s.product_id === productId);
    }
    return MOCK_PRODUCT_SIZES;
  }
}
