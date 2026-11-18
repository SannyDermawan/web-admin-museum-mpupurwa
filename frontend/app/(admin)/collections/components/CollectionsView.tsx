"use client";

import { useCallback, useEffect, useState } from "react";
import CollectionFormModal from "./CollectionFormModal";
import { CollectionsTable } from "./CollectionsTable";
import { CollectionsToolbar } from "./CollectionsToolbar";
import DeleteCollectionModal from "./DeleteCollectionModal";
import type { CollectionDetail, CollectionFormData, CollectionItem } from "./types";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { ERA_OPTIONS } from "@/lib/validations/collections";
import type { CollectionFormValues } from "@/lib/validations/collections";

function toValidEra(era: string): CollectionFormValues["era"] {
  return (ERA_OPTIONS as readonly string[]).includes(era)
    ? (era as CollectionFormValues["era"])
    : "Kanjuruhan";
}

function toListItem(detail: CollectionDetail): CollectionItem {
  return {
    id: detail.id,
    name: detail.name,
    era: detail.era,
    material: detail.material,
    statusMedia: detail.statusMedia,
  };
}

/** Holds the list, the search text and the modals; the toolbar and the table are separate sections in this folder. */
export function CollectionsView() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [editingCollection, setEditingCollection] = useState<CollectionDetail | null>(null);
  const [selectedDeleteItem, setSelectedDeleteItem] = useState<CollectionItem | null>(null);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await apiGet<CollectionItem[]>("/api/collections");
      setCollections(result.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memuat data koleksi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Buka Modal Tambah Koleksi
  const handleOpenAdd = () => {
    setEditingCollection(null);
    setIsFormOpen(true);
  };

  // Buka Modal Edit Koleksi (ambil detail lengkap dari GET /api/collections/:id)
  const handleOpenEdit = async (item: CollectionItem) => {
    setErrorMessage(null);
    try {
      const result = await apiGet<CollectionDetail>(`/api/collections/${item.id}`);
      setEditingCollection(result.data);
      setIsFormOpen(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memuat detail koleksi.");
    }
  };

  // Simpan Tambah / Edit ke Backend (error dilempar kembali agar tampil di alert merah modal)
  const handleSaveCollection = async (data: CollectionFormData) => {
    const payload = {
      name: data.nama,
      era: data.era,
      period: data.periode || null,
      origin: data.asal || null,
      material: data.material || null,
      dimensions: data.ukuran || null,
      meaning: data.makna || null,
      photoUrl: data.fotoUrl,
      videoUrl: data.videoUrl || null,
      pdfUrl: data.pdfUrl,
    };

    if (editingCollection) {
      const result = await apiPatch<CollectionDetail>(`/api/collections/${editingCollection.id}`, payload);
      setCollections((prev) =>
        prev.map((item) => (item.id === editingCollection.id ? toListItem(result.data) : item)),
      );
    } else {
      const result = await apiPost<CollectionDetail>("/api/collections", payload);
      setCollections((prev) => [toListItem(result.data), ...prev]);
    }
  };

  // Buka Modal Hapus
  const handleOpenDelete = (item: CollectionItem) => {
    setSelectedDeleteItem(item);
    setIsDeleteOpen(true);
  };

  // Eksekusi Hapus ke Backend
  const handleConfirmDelete = async () => {
    if (!selectedDeleteItem) return;
    await apiDelete(`/api/collections/${selectedDeleteItem.id}`);
    setCollections((prev) => prev.filter((item) => item.id !== selectedDeleteItem.id));
    setSelectedDeleteItem(null);
  };

  // Filter pencarian
  const filteredCollections = collections.filter((item) => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return true;
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.era.toLowerCase().includes(keyword) ||
      (item.material ?? "").toLowerCase().includes(keyword)
    );
  });

  const initialFormData: Partial<CollectionFormData> | null = editingCollection
    ? {
        nama: editingCollection.name,
        era: toValidEra(editingCollection.era),
        periode: editingCollection.period ?? "",
        asal: editingCollection.origin ?? "",
        material: editingCollection.material ?? "",
        ukuran: editingCollection.dimensions ?? "",
        makna: editingCollection.meaning ?? "",
        videoUrl: editingCollection.videoUrl ?? "",
        fotoUrl: editingCollection.photoUrl,
        pdfUrl: editingCollection.pdfUrl,
      }
    : null;

  return (
    <div className="flex min-h-screen bg-[#F7F5F0] text-[#241A0F] font-sans">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="p-7 px-8 pb-12 flex-1">
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-[#F1CFCD] bg-[#FBEAE9] px-4 py-3 text-[13px] text-[#B3261E]"
            >
              {errorMessage}
            </div>
          )}

          <section className="bg-white border border-[#E6E2D8] rounded-xl overflow-hidden">
            <CollectionsToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAdd={handleOpenAdd}
            />
            {loading ? (
              <div className="py-12 px-[22px] text-center text-[#7A7368] text-[13px]">
                Memuat data koleksi…
              </div>
            ) : (
              <CollectionsTable
                items={filteredCollections}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            )}
          </section>
        </div>
      </div>

      {/* Modal Popup Tambah/Edit Koleksi */}
      <CollectionFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCollection(null);
        }}
        onSave={handleSaveCollection}
        initialData={initialFormData}
      />

      {/* Modal Popup Hapus Koleksi */}
      <DeleteCollectionModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedDeleteItem(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={selectedDeleteItem?.name}
      />
    </div>
  );
}