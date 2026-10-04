"use client";

import React, { useState } from "react";
import CollectionFormModal, { CollectionFormData } from "@/components/collections/CollectionFormModal";
import DeleteCollectionModal from "@/components/collections/DeleteCollectionModal";

interface CollectionItem {
  id: string;
  nama: string;
  era: string;
  material: string;
  statusMedia: "Lengkap" | "Belum ada video" | "Belum ada PDF" | "Belum ada video dan PDF";
}

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);

  // Sample data koleksi museum
  const [collections, setCollections] = useState<CollectionItem[]>([
    {
      id: "1",
      nama: "Arca Ganesya Tikus",
      era: "Singosari",
      material: "Batu andesit",
      statusMedia: "Lengkap",
    },
    {
      id: "2",
      nama: "Arca Brahma",
      era: "Kanjuruhan",
      material: "Batu andesit",
      statusMedia: "Lengkap",
    },
    {
      id: "3",
      nama: "Siwa Catur Muka",
      era: "Tumapel",
      material: "Batu andesit",
      statusMedia: "Belum ada video",
    },
    {
      id: "4",
      nama: "Makara Gapura",
      era: "Singosari",
      material: "Batu andesit",
      statusMedia: "Lengkap",
    },
    {
      id: "5",
      nama: "Prasasti Kanjuruhan",
      era: "Prasasti",
      material: "Batu andesit",
      statusMedia: "Belum ada PDF",
    },
    {
      id: "6",
      nama: "Arca Nandi",
      era: "Tumapel",
      material: "Batu andesit",
      statusMedia: "Belum ada video dan PDF",
    },
  ]);

  // Buka Modal Hapus
  const handleOpenDelete = (item: CollectionItem) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  // Eksekusi Hapus Item
  const handleConfirmDelete = () => {
    if (selectedItem) {
      setCollections((prev: CollectionItem[]) =>
        prev.filter((item: CollectionItem) => item.id !== selectedItem.id)
      );
      setSelectedItem(null);
    }
  };

  // Filter pencarian
  const filteredCollections = collections.filter(
    (item: CollectionItem) =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.era.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.material.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F7F5F0] text-[#241A0F] font-sans">
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Body Content */}
        <div className="p-7 px-8 pb-12 flex-1">
          <section className="bg-white border border-[#E6E2D8] rounded-xl overflow-hidden">
            {/* Toolbar (Search & Add) */}
            <div className="flex items-center justify-between p-4 px-[22px] border-b border-[#E6E2D8] gap-3.5">
              <div className="flex items-center gap-2 bg-[#F7F5F0] border border-[#E6E2D8] rounded-[9px] px-3.5 py-2 w-[280px]">
                <svg
                  className="w-[15px] h-[15px] stroke-[#7A7368] fill-none stroke-[1.7] flex-shrink-0"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari koleksi..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="bg-transparent border-none outline-none text-[13px] w-full text-[#241A0F]"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="bg-[#D4AF37] text-[#1F1F1F] font-bold text-[12.5px] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                + Tambah Koleksi
              </button>
            </div>

            {/* Table */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F7F5F0] text-left text-[11px] font-bold text-[#7A7368] uppercase tracking-wider border-b border-[#E6E2D8]">
                  <th className="py-3 px-[22px]">Nama Koleksi</th>
                  <th className="py-3 px-[22px]">Era / Kerajaan</th>
                  <th className="py-3 px-[22px]">Material</th>
                  <th className="py-3 px-[22px]">Video &amp; PDF</th>
                  <th className="py-3 px-[22px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E2D8] text-[13.5px]">
                {filteredCollections.map((row: CollectionItem) => (
                  <tr key={row.id} className="hover:bg-[#FCFBF8]">
                    <td className="py-3.5 px-[22px] font-bold text-[#241A0F]">
                      {row.nama}
                    </td>
                    <td className="py-3.5 px-[22px]">{row.era}</td>
                    <td className="py-3.5 px-[22px]">{row.material}</td>
                    <td className="py-3.5 px-[22px]">
                      {row.statusMedia === "Lengkap" && (
                        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-1 rounded-full bg-[#E7F3EC] text-[#2F7D4F] border border-[#C9E4D3]">
                          Lengkap
                        </span>
                      )}
                      {(row.statusMedia === "Belum ada video" ||
                        row.statusMedia === "Belum ada PDF") && (
                        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-1 rounded-full bg-[#FBF3DC] text-[#8A6A1E] border border-[#E9D9A8]">
                          {row.statusMedia}
                        </span>
                      )}
                      {row.statusMedia === "Belum ada video dan PDF" && (
                        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-1 rounded-full bg-[#FBEAE9] text-[#B3261E] border border-[#F1CFCD]">
                          {row.statusMedia}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-[22px]">
                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => setIsFormOpen(true)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E6E2D8] text-[#7A7368] hover:text-[#241A0F] hover:bg-gray-50"
                          title="Edit"
                        >
                          <svg
                            className="w-[15px] h-[15px] stroke-current fill-none stroke-[1.6]"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(row)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E6E2D8] text-[#7A7368] hover:bg-[#FBEAE9] hover:border-[#F1CFCD] hover:text-[#B3261E]"
                          title="Hapus"
                        >
                          <svg
                            className="w-[15px] h-[15px] stroke-current fill-none stroke-[1.6]"
                            viewBox="0 0 24 24"
                          >
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {filteredCollections.length === 0 && (
              <div className="py-10 px-[22px] text-center text-[#7A7368] text-[13px]">
                Tidak ada koleksi yang cocok. Coba kata kunci lain.
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal Popup Tambah/Edit Koleksi */}
      <CollectionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={(data: CollectionFormData) => {
          const newItem: CollectionItem = {
            id: Date.now().toString(),
            nama: data.nama,
            era: data.era,
            material: data.material || "Batu andesit",
            statusMedia: data.videoUrl && data.pdfDoc ? "Lengkap" : "Belum ada video",
          };
          setCollections((prev: CollectionItem[]) => [newItem, ...prev]);
        }}
      />

      {/* Modal Popup Hapus Koleksi */}
      <DeleteCollectionModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedItem?.nama}
      />
    </div>
  );
}