"use client";

import { useEffect, useMemo } from "react";
import type { ChangeEvent } from "react";

type FileFieldProps = {
  label: string;
  /** "foto" shows a thumbnail; "dokumen" shows a document icon */
  kind: "foto" | "dokumen";
  accept: string;
  pickLabel: string;
  hint: string;
  /** File chosen now, not uploaded yet */
  file: File | null;
  /** Link of the file that is already saved */
  savedUrl: string | null;
  /** The saved file will be removed when the form is saved */
  removed: boolean;
  error?: string;
  onPick: (file: File) => void;
  onClearPick: () => void;
  onRemovedChange: (removed: boolean) => void;
};

const actionClass =
  "rounded-lg border border-[#E6E2D8] bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#241A0F] hover:bg-[#F7F5F0] cursor-pointer";

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function Icon({ kind }: { kind: FileFieldProps["kind"] }) {
  return (
    <svg className="w-5 h-5 stroke-[#7A7368] fill-none stroke-[1.6] flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      {kind === "foto" ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="11" r="2" />
          <path d="M21 16l-5-5-8 8" />
        </>
      ) : (
        <>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
        </>
      )}
    </svg>
  );
}

/**
 * One upload field of the collection form. Empty: a box to pick a file. With a file (saved or just picked):
 * a card with Lihat (open in a new tab), Ganti, and Hapus / Batalkan. Nothing changes until the form is saved.
 */
export function FileField(props: FileFieldProps) {
  const { label, kind, accept, pickLabel, hint, file, savedUrl, removed, error, onPick, onClearPick, onRemovedChange } = props;

  // A temporary address so the picked file can be previewed before it is uploaded.
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    // Reset so that picking the same file again still triggers a change.
    event.target.value = "";
    if (picked) {
      onRemovedChange(false);
      onPick(picked);
    }
  }

  const url = file ? previewUrl : removed ? null : savedUrl;
  const border = error ? "border-[#B3261E]" : "border-[#CFC9BA]";
  const input = <input type="file" accept={accept} onChange={handleChange} className="sr-only" aria-label={label} />;

  return (
    <div className="mb-3.5">
      <span className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">{label}</span>

      {url ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#E6E2D8] bg-[#F7F5F0] p-3">
          {kind === "foto" ? (
            // eslint-disable-next-line @next/next/no-img-element -- a small preview of a blob: or storage link
            <img src={url} alt="Pratinjau foto koleksi" className="size-14 rounded-md border border-[#E6E2D8] object-cover" />
          ) : (
            <span className="flex size-11 items-center justify-center rounded-md border border-[#E6E2D8] bg-white">
              <Icon kind={kind} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold break-all">
              {file ? file.name : kind === "foto" ? "Foto koleksi" : "Dokumen informasi.pdf"}
            </div>
            <div className="text-[12px] text-[#7A7368] mt-0.5">
              {file ? `${formatSize(file.size)} · diunggah saat disimpan` : "Tersimpan"}
            </div>
          </div>
          <div className="flex gap-1.5">
            <a href={url} target="_blank" rel="noreferrer" className={actionClass}>
              Lihat
            </a>
            <label className={actionClass}>
              Ganti
              {input}
            </label>
            <button
              type="button"
              className={`${actionClass} !text-[#B3261E]`}
              onClick={() => (file ? onClearPick() : onRemovedChange(true))}
            >
              {file ? "Batalkan" : "Hapus"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <label className={`flex items-center gap-3 border border-dashed rounded-lg p-3 bg-[#F7F5F0] cursor-pointer hover:border-[#D4AF37] ${border}`}>
            <Icon kind={kind} />
            <div>
              <div className="text-[13px] font-bold">{pickLabel}</div>
              <div className="text-[12px] text-[#7A7368] mt-0.5">{hint}</div>
            </div>
            {input}
          </label>
          {removed && savedUrl && (
            <div className="mt-1.5 flex items-center gap-2 text-[12px] text-[#B3261E]">
              File lama akan dihapus saat disimpan.
              <button type="button" className="font-bold underline" onClick={() => onRemovedChange(false)}>
                Urungkan
              </button>
            </div>
          )}
        </>
      )}

      {error && <div className="text-[12px] text-[#B3261E] mt-1">{error}</div>}
    </div>
  );
}
