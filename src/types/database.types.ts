export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "customer" | "admin";
export type OrderStatus = "Received" | "Printing" | "Shipped" | "Delivered" | "Cancelled";
export type PaperFinish = "matte" | "glossy";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  name: string;
  dimensions_cm: string;
  width_px_300dpi: number;
  height_px_300dpi: number;
  bleed_mm: number;
  price_inr: number;
  sort_order: number;
  created_at: string;
}

export interface Design {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  category?: Category;
  tags: string[];
  high_res_storage_path: string;
  watermark_storage_path: string;
  thumbnail_storage_path: string;
  starting_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Upload {
  id: string;
  user_id: string | null;
  session_id?: string | null;
  original_storage_path: string;
  preview_storage_path: string | null;
  filename: string;
  file_size: number;
  mime_type: string;
  width: number;
  height: number;
  calculated_dpi: number;
  dpi_check: boolean;
  created_at: string;
}

export interface CustomEditorConfig {
  crop?: { x: number; y: number; width: number; height: number };
  zoom?: number;
  position?: { x: number; y: number };
  rotation?: number;
  filter?: "none" | "grayscale" | "vintage" | "sketch";
  text?: {
    content: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    position: { x: number; y: number };
  };
}

export interface CartItem {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  design_id?: string | null;
  design?: Design;
  upload_id?: string | null;
  upload?: Upload;
  product_id: string;
  product?: Product;
  size_id: string;
  size?: ProductSize;
  finish: PaperFinish;
  quantity: number;
  price_inr: number;
  custom_config?: CustomEditorConfig;
  preview_url?: string;
  title?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  tracking_carrier?: string | null;
  tracking_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payments?: Payment[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  design_id?: string | null;
  upload_id?: string | null;
  product_id?: string | null;
  size_id?: string | null;
  product_name: string;
  size_name: string;
  finish: PaperFinish;
  quantity: number;
  unit_price: number;
  total_price: number;
  custom_config?: CustomEditorConfig;
  design?: Design;
  upload?: Upload;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  amount: number;
  currency: string;
  raw_response?: Json;
  created_at: string;
  updated_at: string;
}
