"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import type { ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { CollectionFormData } from "./types";
import { uploadFile } from "@/lib/upload";
import { collectionSchema, ERA_OPTIONS } from "@/lib/validations/collections";
import type { CollectionFormValues } from "@/lib/validations/collections";

interface CollectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the text fields and the Vercel Blob links, after the files were uploaded. */
  onSave: (data: CollectionFormData) => void | Promise<void>;
  initialData?: Partial<CollectionFormData> | null;
}

const EMPTY_VALUES: CollectionFormValues = {
  nama: "",
  era: "Kanjuruhan",
  periode: "",
  asal: "",
  material: "",
  ukuran: "",
  makna: "",
  videoUrl: "",
  foto: null,
  pdfDoc: null,
};

const inputClass = (error?: string) =>
  `w-full border rounded-lg p-2.5 px-3 outline-none ${
    error ? "border-[#B3261E]" : "border-[#E6E2D8] focus:border-[#D4AF37]"
  }`;

function FieldError({ message }: { message?: string }) {
  return message ? <div className="text-[12px] text-[#B3261E] mt-1">{message}</div> : null;
}

export default function CollectionFormModal({ isOpen, onClose, onSave, initialData }: CollectionFormModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: EMPTY_VALUES,
  });

  // Start from the collection being edited, or from an empty form, every time the popup opens.
  useEffect(() => {
    if (!isOpen) return;
    reset({
      ...EMPTY_VALUES,
      nama: initialData?.nama ?? "",
      era: initialData?.era ?? "Kanjuruhan",
      periode: initialData?.periode ?? "",
      asal: initialData?.asal ?? "",
      material: initialData?.material ?? "",
      ukuran: initialData?.ukuran ?? "",
      makna: initialData?.makna ?? "",
      videoUrl: initialData?.videoUrl ?? "",
    });
  }, [isOpen, initialData, reset]);

  const foto = useWatch({ control, name: "foto" });
  const pdfDoc = useWatch({ control, name: "pdfDoc" });

  if (!isOpen) return null;

  const fotoName = foto?.name ?? (initialData?.fotoUrl ? "Foto sudah tersimpan." : "Belum ada foto. Format JPG atau PNG.");
  const pdfName = pdfDoc?.name ?? (initialData?.pdfUrl ? "Dokumen sudah tersimpan." : "Belum ada dokumen.");

  const handleFileChange = (field: "foto" | "pdfDoc") => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setValue(field, file, { shouldValidate: true, shouldDirty: true });
  };

  async function onSubmit(values: CollectionFormValues) {
    try {
      // Only a newly chosen file is uploaded; otherwise the link that was already saved is kept.
      const [fotoUrl, pdfUrl] = await Promise.all([
        values.foto ? uploadFile(values.foto, "foto") : Promise.resolve(initialData?.fotoUrl ?? null),
        values.pdfDoc ? uploadFile(values.pdfDoc, "dokumen") : Promise.resolve(initialData?.pdfUrl ?? null),
      ]);

      await onSave({
        nama: values.nama,
        era: values.era,
        periode: values.periode,
        asal: values.asal,
        material: values.material,
        ukuran: values.ukuran,
        makna: values.makna,
        videoUrl: values.videoUrl,
        fotoUrl,
        pdfUrl,
      });
      onClose();
    } catch (error) {
      setError("root.server", { message: error instanceof Error ? error.message : "Gagal menyimpan koleksi." });
    }
  }

  return (
    <div className="fixed inset-0 bg-[#1F1A0F]/40 z-[100] flex items-center justify-center p-6">
      <div className="bg-white rounded-[14px] w-full max-w-[600px] max-h-[88vh] overflow-y-auto shadow-[0_30px_60px_rgba(0,0,0,0.25)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 px-6 border-b border-[#E6E2D8]">
          <h3 className="font-serif text-[17px] font-semibold text-[#241A0F]">
            {initialData ? "Edit Koleksi" : "Tambah Koleksi"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7A7368] hover:bg-[#F7F5F0] transition-colors"
          >
            <svg className="w-4 h-4 stroke-current fill-none stroke-[1.8]" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="p-6 text-[13.5px] text-[#241A0F]">
            {errors.root?.server && (
              <div
                role="alert"
                className="mb-3.5 rounded-lg border border-[#F1CFCD] bg-[#FBEAE9] px-3 py-2.5 text-[12.5px] leading-snug text-[#B3261E]"
              >
                {errors.root.server.message}
              </div>
            )}

            {/* Nama Koleksi */}
            <div className="mb-3.5">
              <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">Nama koleksi</label>
              <input
                type="text"
                placeholder="Contoh: Arca Ganesya Tikus"
                className={`${inputClass(errors.nama?.message)} text-[13.5px]`}
                {...register("nama")}
              />
              <FieldError message={errors.nama?.message} />
            </div>

            {/* Era & Periode */}
            <div className="grid grid-cols-2 gap-3.5 mb-3.5">
              <div>
                <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">Era / kerajaan</label>
                <select
                  className={`${inputClass(errors.era?.message)} bg-white`}
                  {...register("era")}
                >
                  {ERA_OPTIONS.map((era) => (
                    <option key={era} value={era}>
                      {era}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.era?.message} />
              </div>
              <div>
                <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">Periode</label>
                <input
                  type="text"
                  placeholder="Contoh: Abad 13"
                  className={inputClass(errors.periode?.message)}
                  {...register("periode")}
                />
                <FieldError message={errors.periode?.message} />
              </div>
            </div>

            {/* Asal & Material */}
            <div className="grid grid-cols-2 gap-3.5 mb-3.5">
              <div>
                <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">Asal temuan</label>
                <input
                  type="text"
                  placeholder="Contoh: Malang Raya"
                  className={inputClass(errors.asal?.message)}
                  {...register("asal")}
                />
                <FieldError message={errors.asal?.message} />
              </div>
              <div>
                <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">Material</label>
                <input
                  type="text"
                  placeholder="Contoh: Batu andesit"
                  className={inputClass(errors.material?.message)}
                  {...register("material")}
                />
                <FieldError message={errors.material?.message} />
              </div>
            </div>

            {/* Ukuran */}
            <div className="mb-3.5">
              <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">Ukuran</label>
              <input
                type="text"
                placeholder="Contoh: T 90 cm, L 60 cm"
                className={inputClass(errors.ukuran?.message)}
                {...register("ukuran")}
              />
              <FieldError message={errors.ukuran?.message} />
            </div>

            {/* Sejarah dan Makna */}
            <div className="mb-3.5">
              <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">Sejarah dan makna</label>
              <textarea
                placeholder="Tuliskan sejarah, fungsi, dan makna koleksi. Teks ini tampil di halaman detail aplikasi."
                className={`${inputClass(errors.makna?.message)} min-h-[96px] resize-y`}
                {...register("makna")}
              ></textarea>
              <FieldError message={errors.makna?.message} />
            </div>

            {/* Media Upload Section */}
            <div className="font-serif text-[14px] font-semibold my-5 mt-6 pt-4 border-t border-[#E6E2D8]">
              Foto, video, dan dokumen
            </div>

            {/* Foto Koleksi */}
            <div className="mb-3.5">
              <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">Foto koleksi</label>
              <label
                className={`flex items-center gap-3 border border-dashed rounded-lg p-3 bg-[#F7F5F0] cursor-pointer hover:border-[#D4AF37] ${
                  errors.foto ? "border-[#B3261E]" : "border-[#CFC9BA]"
                }`}
              >
                <svg className="w-5 h-5 stroke-[#7A7368] fill-none stroke-[1.6] flex-shrink-0" viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <circle cx="9" cy="11" r="2" />
                  <path d="M21 16l-5-5-8 8" />
                </svg>
                <div>
                  <div className="text-[13px] font-bold">Pilih foto</div>
                  <div className="text-[12px] text-[#7A7368] mt-0.5 break-all">{fotoName}</div>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange("foto")}
                  className="hidden"
                />
              </label>
              <FieldError message={errors.foto?.message} />
            </div>

            {/* Link YouTube */}
            <div className="mb-3.5">
              <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">Link video YouTube</label>
              <input
                type="text"
                placeholder="https://youtu.be/..."
                className={inputClass(errors.videoUrl?.message)}
                {...register("videoUrl")}
              />
              <FieldError message={errors.videoUrl?.message} />
              <div className="text-[12px] text-[#7A7368] mt-1 leading-snug">
                Kosongkan jika belum ada video. Tombol Tonton Video di aplikasi akan tersembunyi.
              </div>
            </div>

            {/* PDF Dokumen */}
            <div className="mb-0">
              <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">Dokumen informasi (PDF)</label>
              <label
                className={`flex items-center gap-3 border border-dashed rounded-lg p-3 bg-[#F7F5F0] cursor-pointer hover:border-[#D4AF37] ${
                  errors.pdfDoc ? "border-[#B3261E]" : "border-[#CFC9BA]"
                }`}
              >
                <svg className="w-5 h-5 stroke-[#7A7368] fill-none stroke-[1.6] flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
                <div>
                  <div className="text-[13px] font-bold">Pilih file PDF</div>
                  <div className="text-[12px] text-[#7A7368] mt-0.5 break-all">{pdfName}</div>
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange("pdfDoc")}
                  className="hidden"
                />
              </label>
              <FieldError message={errors.pdfDoc?.message} />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-2.5 p-4 px-6 pb-6 border-t border-[#E6E2D8]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-[11px] text-[12.5px] font-bold rounded-lg bg-white border border-[#E6E2D8] text-[#241A0F] hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-[11px] text-[12.5px] font-bold rounded-lg bg-[#D4AF37] text-[#1F1F1F] hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Menyimpan…" : "Simpan koleksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
