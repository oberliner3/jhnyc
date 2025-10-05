import { API_CONFIG } from "@/lib/constants";

export async function fetchJsonData<T>(path: string, options?: RequestInit): Promise<T> {
  const url = new URL(path, API_CONFIG.PRODUCT_STREAM_API);
  const response = await fetch(url.toString(), options);

  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url.toString()}: ${response.statusText}`);
  }

  return response.json();
}