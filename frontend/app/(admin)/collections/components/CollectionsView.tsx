"use client";

import { useState } from "react";
import CollectionFormModal from "./CollectionFormModal";
import { CollectionsTable } from "./CollectionsTable";
import { CollectionsToolbar } from "./CollectionsToolbar";
import DeleteCollectionModal from "./DeleteCollectionModal";
import { getMediaStatus } from "./types";
import type { CollectionFormData, CollectionItem } from "./types";

// Sample data koleksi museum
const INITIAL_COLLECTIONS: CollectionItem[] = [
  { id: "1", nama: "Arca Ganesya Tikus", era: "Singosari", material: "Batu andesit", statusMedia: "Lengkap" },
  { id: "2", nama: "Arca Brahma", era: "Kanjuruhan", material: "Batu andesit", statusMedia: "Lengkap" },
  { id: "3", nama: "Siwa Catur Muka", era: "Tumapel", material: "Batu andesit", statusMedia: "Belum ada video" },
  { id: "4", nama: "Makara Gapura", era: "Singosari", material: "Batu andesit", statusMedia: "Lengkap" },
  { id: "5", nama: "Prasasti Kanjuruhan", era: "Prasasti", material: "Batu andesit", statusMedia: "Belum ada PDF" },
  { id: "6", nama: "Arca Nandi", era: "Tumapel", material: "Batu andesit", statusMedia: "Belum ada video dan PDF" },
];

/** Holds the list, the search text and the modals; the toolbar and the table are separate sections in this folder. */
export function CollectionsView() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [collections, setCollections] = useState<CollectionItem[]>(INITIAL_COLLECTIONS);

  // Buka Modal Hapus
  const handleOpenDelete = (item: CollectionItem) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  // Eksekusi Hapus Item
  const handleConfirmDelete = () => {
    if (selectedItem) {
      setCollections((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setSelectedItem(null);
    }
  };

  // Filter pencarian
  const filteredCollections = collections.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.era.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.material.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F7F5F0] text-[#241A0F] font-sans">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="p-7 px-8 pb-12 flex-1">
          <section className="bg-white border border-[#E6E2D8] rounded-xl overflow-hidden">
            <CollectionsToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAdd={() => setIsFormOpen(true)}
            />
            <CollectionsTable
              items={filteredCollections}
              onEdit={() => setIsFormOpen(true)}
              onDelete={handleOpenDelete}
            />
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
            statusMedia: getMediaStatus(data.videoUrl, data.pdfUrl),
            fotoUrl: data.fotoUrl,
            pdfUrl: data.pdfUrl,
            videoUrl: data.videoUrl,
          };
          setCollections((prev) => [newItem, ...prev]);
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
