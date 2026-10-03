"use client";

import React, { useState, useEffect } from "react";

export interface CollectionFormData {
  nama: string;
  era: string;
  periode: string;
  asal: string;
  material: string;
  ukuran: string;
  makna: string;
  foto?: File | null;
  videoUrl: string;
  pdfDoc?: File | null;
}

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
  const [formData, setFormData] = useState<CollectionFormData>({
    nama: "",
    era: "Kanjuruhan",
    periode: "",
    asal: "",
    material: "",
    ukuran: "",
    makna: "",
    foto: null,
    videoUrl: "",
    pdfDoc: null,
  });

  const [errors, setErrors] = useState<{ nama?: string }>({});
  const [fotoName, setFotoName] = useState<string>("Belum ada foto. Format JPG atau PNG.");
  const [pdfName, setPdfName] = useState<string>("Belum ada dokumen.");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nama: "",
        era: "Kanjuruhan",
        periode: "",
        asal: "",
        material: "",
        ukuran: "",
        makna: "",
        foto: null,
        videoUrl: "",
        pdfDoc: null,
      });
      setFotoName("Belum ada foto. Format JPG atau PNG.");
      setPdfName("Belum ada dokumen.");
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "nama" && value.trim()) {
      setErrors((prev) => ({ ...prev, nama: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "foto" | "pdfDoc") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, [field]: file }));
      if (field === "foto") setFotoName(file.name);
      if (field === "pdfDoc") setPdfName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      setErrors({ nama: "Nama koleksi wajib diisi." });
      return;
    }
    onSave(formData);
    onClose();
  };

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
        <form onSubmit={handleSubmit}>
          <div className="p-6 text-[13.5px] text-[#241A0F]">
            {/* Nama Koleksi */}
            <div className="mb-3.5">
              <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">
                Nama koleksi
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Contoh: Arca Ganesya Tikus"
                className={`w-full border rounded-lg p-2.5 px-3 outline-none text-[13.5px] ${
                  errors.nama ? "border-[#B3261E]" : "border-[#E6E2D8] focus:border-[#D4AF37]"
                }`}
              />
              {errors.nama && (
                <div className="text-[12px] text-[#B3261E] mt-1">{errors.nama}</div>
              )}
            </div>

            {/* Era & Periode */}
            <div className="grid grid-cols-2 gap-3.5 mb-3.5">
              <div>
                <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">
                  Era / kerajaan
                </label>
                <select
                  name="era"
                  value={formData.era}
                  onChange={handleChange}
                  className="w-full border border-[#E6E2D8] rounded-lg p-2.5 px-3 bg-white outline-none focus:border-[#D4AF37]"
                >
                  <option value="Kanjuruhan">Kanjuruhan</option>
                  <option value="Tumapel">Tumapel</option>
                  <option value="Singosari">Singosari</option>
                  <option value="Majapahit">Majapahit</option>
                  <option value="Prasasti">Prasasti</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">
                  Periode
                </label>
                <input
                  type="text"
                  name="periode"
                  value={formData.periode}
                  onChange={handleChange}
                  placeholder="Contoh: Abad 13"
                  className="w-full border border-[#E6E2D8] rounded-lg p-2.5 px-3 outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Asal & Material */}
            <div className="grid grid-cols-2 gap-3.5 mb-3.5">
              <div>
                <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">
                  Asal temuan
                </label>
                <input
                  type="text"
                  name="asal"
                  value={formData.asal}
                  onChange={handleChange}
                  placeholder="Contoh: Malang Raya"
                  className="w-full border border-[#E6E2D8] rounded-lg p-2.5 px-3 outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">
                  Material
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  placeholder="Contoh: Batu andesit"
                  className="w-full border border-[#E6E2D8] rounded-lg p-2.5 px-3 outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Ukuran */}
            <div className="mb-3.5">
              <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">
                Ukuran
              </label>
              <input
                type="text"
                name="ukuran"
                value={formData.ukuran}
                onChange={handleChange}
                placeholder="Contoh: T 90 cm, L 60 cm"
                className="w-full border border-[#E6E2D8] rounded-lg p-2.5 px-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Sejarah dan Makna */}
            <div className="mb-3.5">
              <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">
                Sejarah dan makna
              </label>
              <textarea
                name="makna"
                value={formData.makna}
                onChange={handleChange}
                placeholder="Tuliskan sejarah, fungsi, dan makna koleksi. Teks ini tampil di halaman detail aplikasi."
                className="w-full border border-[#E6E2D8] rounded-lg p-2.5 px-3 outline-none min-h-[96px] focus:border-[#D4AF37] resize-y"
              ></textarea>
            </div>

            {/* Media Upload Section */}
            <div className="font-serif text-[14px] font-semibold my-5 mt-6 pt-4 border-t border-[#E6E2D8]">
              Foto, video, dan dokumen
            </div>

            {/* Foto Koleksi */}
            <div className="mb-3.5">
              <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">
                Foto koleksi
              </label>
              <label className="flex items-center gap-3 border border-dashed border-[#CFC9BA] rounded-lg p-3 bg-[#F7F5F0] cursor-pointer hover:border-[#D4AF37]">
                <svg
                  className="w-5 h-5 stroke-[#7A7368] fill-none stroke-[1.6] flex-shrink-0"
                  viewBox="0 0 24 24"
                >
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
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "foto")}
                  className="hidden"
                />
              </label>
            </div>

            {/* Link YouTube */}
            <div className="mb-3.5">
              <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">
                Link video YouTube
              </label>
              <input
                type="text"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://youtu.be/..."
                className="w-full border border-[#E6E2D8] rounded-lg p-2.5 px-3 outline-none focus:border-[#D4AF37]"
              />
              <div className="text-[12px] text-[#7A7368] mt-1 leading-snug">
                Kosongkan jika belum ada video. Tombol Tonton Video di aplikasi akan tersembunyi.
              </div>
            </div>

            {/* PDF Dokumen */}
            <div className="mb-0">
              <label className="text-[12px] font-bold mb-1.5 block text-[#241A0F]">
                Dokumen informasi (PDF)
              </label>
              <label className="flex items-center gap-3 border border-dashed border-[#CFC9BA] rounded-lg p-3 bg-[#F7F5F0] cursor-pointer hover:border-[#D4AF37]">
                <svg
                  className="w-5 h-5 stroke-[#7A7368] fill-none stroke-[1.6] flex-shrink-0"
                  viewBox="0 0 24 24"
                >
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
                  onChange={(e) => handleFileChange(e, "pdfDoc")}
                  className="hidden"
                />
              </label>
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
              className="flex-1 py-[11px] text-[12.5px] font-bold rounded-lg bg-[#D4AF37] text-[#1F1F1F] hover:opacity-90 transition-opacity"
            >
              Simpan koleksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}