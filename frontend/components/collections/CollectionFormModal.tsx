"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { collectionSchema, CollectionFormValues } from "../../lib/collections";

// Ekspor alias agar kompatibel dengan CollectionsView.tsx
export type CollectionFormData = CollectionFormValues;

interface CollectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CollectionFormData) => void;
  initialData?: CollectionFormData | null;
}

export default function CollectionFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: CollectionFormModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
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
    },
  });

  // Reset form saat modal dibuka atau initialData berubah
  useEffect(() => {
    if (isOpen) {
      reset({
        nama: initialData?.nama ?? "",
        era: (initialData?.era as CollectionFormValues["era"]) ?? "Kanjuruhan",
        periode: initialData?.periode ?? "",
        asal: initialData?.asal ?? "",
        material: initialData?.material ?? "",
        ukuran: initialData?.ukuran ?? "",
        makna: initialData?.makna ?? "",
        videoUrl: initialData?.videoUrl ?? "",
        foto: initialData?.foto ?? null,
        pdfDoc: initialData?.pdfDoc ?? null,
      });
    }
  }, [isOpen, initialData, reset]);

  // Hook useWatch wajib dipanggil di sini (sebelum `if (!isOpen) return null;`)
  const currentFoto = useWatch({ control, name: "foto" });
  const currentPdf = useWatch({ control, name: "pdfDoc" });

  if (!isOpen) return null;

  const onFormSubmit = async (data: CollectionFormValues) => {
    await onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Koleksi" : "Tambah Koleksi"}
        </h2>

        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
          {/* Field Nama */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nama Koleksi *</label>
            <input
              type="text"
              {...register("nama")}
              className="w-full rounded border p-2 text-sm"
            />
            {errors.nama && (
              <p className="text-[#B3261E] text-xs mt-1">{errors.nama.message}</p>
            )}
          </div>

          {/* Field Era */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Era *</label>
            <select {...register("era")} className="w-full rounded border p-2 text-sm">
              <option value="Kanjuruhan">Kanjuruhan</option>
              <option value="Tumapel">Tumapel</option>
              <option value="Singosari">Singosari</option>
              <option value="Majapahit">Majapahit</option>
              <option value="Prasasti">Prasasti</option>
            </select>
            {errors.era && (
              <p className="text-[#B3261E] text-xs mt-1">{errors.era.message}</p>
            )}
          </div>

          {/* Field Periode & Asal */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Periode</label>
              <input
                type="text"
                {...register("periode")}
                className="w-full rounded border p-2 text-sm"
              />
              {errors.periode && (
                <p className="text-[#B3261E] text-xs mt-1">{errors.periode.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Asal</label>
              <input
                type="text"
                {...register("asal")}
                className="w-full rounded border p-2 text-sm"
              />
              {errors.asal && (
                <p className="text-[#B3261E] text-xs mt-1">{errors.asal.message}</p>
              )}
            </div>
          </div>

          {/* Field Material & Ukuran */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Material</label>
              <input
                type="text"
                {...register("material")}
                className="w-full rounded border p-2 text-sm"
              />
              {errors.material && (
                <p className="text-[#B3261E] text-xs mt-1">{errors.material.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ukuran</label>
              <input
                type="text"
                {...register("ukuran")}
                className="w-full rounded border p-2 text-sm"
              />
              {errors.ukuran && (
                <p className="text-[#B3261E] text-xs mt-1">{errors.ukuran.message}</p>
              )}
            </div>
          </div>

          {/* Field Makna */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Makna / Sejarah</label>
            <textarea
              {...register("makna")}
              rows={3}
              className="w-full rounded border p-2 text-sm"
            />
            {errors.makna && (
              <p className="text-[#B3261E] text-xs mt-1">{errors.makna.message}</p>
            )}
          </div>

          {/* Field Video URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">URL Video</label>
            <input
              type="text"
              {...register("videoUrl")}
              placeholder="https://..."
              className="w-full rounded border p-2 text-sm"
            />
            {errors.videoUrl && (
              <p className="text-[#B3261E] text-xs mt-1">{errors.videoUrl.message}</p>
            )}
          </div>

          {/* Input Upload Foto */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Upload Foto (JPG/PNG)</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setValue("foto", file, { shouldValidate: true });
              }}
              className="w-full text-sm"
            />
            {currentFoto && <p className="text-xs text-gray-500 mt-1">File: {currentFoto.name}</p>}
            {errors.foto && (
              <p className="text-[#B3261E] text-xs mt-1">{errors.foto.message}</p>
            )}
          </div>

          {/* Input Upload Dokumen PDF */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Upload Dokumen PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setValue("pdfDoc", file, { shouldValidate: true });
              }}
              className="w-full text-sm"
            />
            {currentPdf && <p className="text-xs text-gray-500 mt-1">File: {currentPdf.name}</p>}
            {errors.pdfDoc && (
              <p className="text-[#B3261E] text-xs mt-1">{errors.pdfDoc.message}</p>
            )}
          </div>

          {/* Tombol Action */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded border border-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded bg-amber-600 text-white disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}