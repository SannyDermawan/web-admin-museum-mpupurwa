// Uploads a file (collection photo or PDF) through our backend, which stores it in Vercel Blob.
// The Blob token stays on the server; the browser only sends the file and gets back its public link.

import { apiPostForm } from "@/lib/api";
import type { UploadKind, UploadResult } from "@/types";

/** Uploads `file` and returns its public https link, the value to save in the database. */
export async function uploadFile(file: File, kind: UploadKind): Promise<string> {
  const form = new FormData();
  form.append("kind", kind); // before the file, so the backend sees it first
  form.append("file", file);

  const { data } = await apiPostForm<UploadResult>("/api/uploads", form);
  return data.url;
}
