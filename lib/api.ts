import { PRODUCT_STREAM_API } from "@/lib/constants";

export async function fetchJsonData<T>(path: string, options?: RequestInit): Promise<T> {
  const url = new URL(path, PRODUCT_STREAM_API);
  const response = await fetch(url.toString(), options);

  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url.toString()}: ${response.statusText}`);
  }

  return response.json();
}