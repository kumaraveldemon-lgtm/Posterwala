import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-supabase.posterwala.internal";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-service-role-key";

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Generate a secure signed URL for private files in Supabase Storage
 */
export async function getSignedStorageUrl(bucket: string, path: string, expiresInSeconds = 3600): Promise<string> {
  // If in mock or placeholder mode, return a fallback or direct path
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith("mock")) {
    if (path.startsWith("http")) return path;
    return `/api/placeholder-asset?bucket=${bucket}&path=${encodeURIComponent(path)}`;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    console.error("Failed to generate signed URL:", error);
    return "";
  }

  return data.signedUrl;
}
