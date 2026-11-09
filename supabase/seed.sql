-- ==============================================================================
-- POSTERWALA SEED DATA
-- ==============================================================================

-- 1. Insert Categories
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Minimal', 'minimal', 'Clean lines, modern geometry, and subtle typography', 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Anime', 'anime', 'Iconic moments, dynamic scenes, and aesthetic Japanese art', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Travel', 'travel', 'Wanderlust-inducing landscapes, vintage travel posters, and cityscapes', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Quotes', 'quotes', 'Inspirational words, typographic wonders, and mindful thoughts', 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80', 4),
  ('c1000000-0000-0000-0000-000000000005', 'Abstract', 'abstract', 'Bold colors, expressive textures, and contemporary fine art', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80', 5)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Products
INSERT INTO public.products (id, name, slug, description, image_url, sort_order) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'Poster', 'poster', 'Gallery-grade art poster on heavyweight 300 GSM cardstock', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80', 1),
  ('p1000000-0000-0000-0000-000000000002', 'Polaroid pack', 'polaroid-pack', 'Vintage retro polaroid style prints in packs with classic white borders', 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80', 2),
  ('p1000000-0000-0000-0000-000000000003', 'Photo print', 'photo-print', 'Vibrant photographic prints with color fidelity on archival photo paper', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80', 3)
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Product Sizes
-- Poster sizes
INSERT INTO public.product_sizes (id, product_id, name, dimensions_cm, width_px_300dpi, height_px_300dpi, bleed_mm, price_inr, sort_order) VALUES
  ('s1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'A4 (8.3 x 11.7 in)', '21.0 x 29.7 cm', 2480, 3508, 3, 299.00, 1),
  ('s1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', 'A3 (11.7 x 16.5 in)', '29.7 x 42.0 cm', 3508, 4961, 3, 499.00, 2),
  ('s1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000001', 'A2 (16.5 x 23.4 in)', '42.0 x 59.4 cm', 4961, 7016, 3, 899.00, 3),

-- Polaroid pack sizes
  ('s1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000002', 'Pack of 12 (3.5 x 4.2 in)', '8.8 x 10.7 cm', 1050, 1260, 2, 349.00, 1),
  ('s1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000002', 'Pack of 24 (3.5 x 4.2 in)', '8.8 x 10.7 cm', 1050, 1260, 2, 599.00, 2),

-- Photo prints sizes
  ('s1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000003', '4 x 6 in (Standard)', '10.2 x 15.2 cm', 1200, 1800, 2, 99.00, 1),
  ('s1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000003', '5 x 7 in (Classic)', '12.7 x 17.8 cm', 1500, 2100, 2, 149.00, 2),
  ('s1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000003', '8 x 10 in (Large)', '20.3 x 25.4 cm', 2400, 3000, 3, 249.00, 3)
ON CONFLICT (product_id, name) DO NOTHING;

-- 4. Insert Sample Curated Designs
INSERT INTO public.designs (id, title, slug, description, category_id, tags, high_res_storage_path, watermark_storage_path, thumbnail_storage_path, starting_price, is_active) VALUES
  (
    'd1000000-0000-0000-0000-000000000001',
    'Kyoto Solitude',
    'kyoto-solitude',
    'A serene Japanese torii gateway illuminated by soft evening dusk in Kyoto.',
    'c1000000-0000-0000-0000-000000000003',
    ARRAY['japan', 'travel', 'minimal', 'kyoto'],
    'originals/kyoto-solitude.jpg',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    299.00,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000002',
    'Geometric Horizon',
    'geometric-horizon',
    'Bauhaus inspired composition featuring warm earthen terracotta arches and balanced forms.',
    'c1000000-0000-0000-0000-000000000001',
    ARRAY['bauhaus', 'minimal', 'shapes', 'warm'],
    'originals/geometric-horizon.jpg',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
    299.00,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000003',
    'Cyberpunk Neo Tokyo',
    'cyberpunk-neo-tokyo',
    'Vibrant futuristic neon lights cutting through rain-slicked midnight streets.',
    'c1000000-0000-0000-0000-000000000002',
    ARRAY['anime', 'cyberpunk', 'tokyo', 'neon'],
    'originals/cyberpunk-neo-tokyo.jpg',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    349.00,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000004',
    'Stay Hungry Stay Foolish',
    'stay-hungry-stay-foolish',
    'Bold editorial Swiss typography featuring the timeless Steve Jobs mantra.',
    'c1000000-0000-0000-0000-000000000004',
    ARRAY['quotes', 'typography', 'inspiration', 'monochrome'],
    'originals/stay-hungry-stay-foolish.jpg',
    'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&q=80',
    299.00,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000005',
    'Terra Rosa Chromatics',
    'terra-rosa-chromatics',
    'Rich abstract brushstrokes combining burnt orange, deep ochre and warm cream.',
    'c1000000-0000-0000-0000-000000000005',
    ARRAY['abstract', 'texture', 'modern', 'canvas'],
    'originals/terra-rosa-chromatics.jpg',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    399.00,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000006',
    'Amalfi Coastline Reverie',
    'amalfi-coastline-reverie',
    'Sun-kissed Italian cliffs cascading down into crystal turquoise Mediterranean waters.',
    'c1000000-0000-0000-0000-000000000003',
    ARRAY['travel', 'italy', 'amalfi', 'summer'],
    'originals/amalfi-coastline-reverie.jpg',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
    349.00,
    true
  )
ON CONFLICT (slug) DO NOTHING;
