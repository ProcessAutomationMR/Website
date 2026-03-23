const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

export function getStorageUrl(path: string): string {
  const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `${supabaseUrl}/storage/v1/object/public/Photos/${encodedPath}`;
}
