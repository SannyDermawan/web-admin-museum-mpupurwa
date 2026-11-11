// File uploads (Vercel Blob). These mirror backend/src/types/uploads.ts (the API contract between the two apps).

/** What is being uploaded: a collection photo or a collection PDF document. */
export type UploadKind = "foto" | "dokumen";

/** POST /api/uploads   multipart/form-data with the fields `file` and `kind` */
export type UploadResult = {
  /** Public https link of the stored file; this is what gets saved in the database. */
  url: string;
  pathname: string;
  size: number;
  contentType: string;
};
