"use client";

import React from "react";

interface DeleteCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

export default function DeleteCollectionModal({
  isOpen,
  onClose,
  onConfirm,
  itemName = "Koleksi ini",
}: DeleteCollectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1F1A0F]/40 z-[100] flex items-center justify-center p-6">
      <div className="bg-white rounded-[14px] w-full max-w-[380px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.25)]">
        {/* Modal Body */}
        <div className="p-[22px] px-6 pt-[28px] text-center">
          {/* Danger Icon */}
          <div className="w-[52px] h-[52px] rounded-full bg-[#FBEAE9] flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 stroke-[#B3261E] fill-none stroke-[1.8]"
              viewBox="0 0 24 24"
            >
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" />
            </svg>
          </div>

          <h3 className="font-serif text-[17px] font-semibold text-[#241A0F] mb-2">
            Hapus koleksi ini?
          </h3>
          <p className="text-[13px] text-[#7A7368] leading-normal">
            <b className="text-[#241A0F]">{itemName}</b> akan hilang dari katalog
            di aplikasi pengunjung. Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-2.5 p-4 px-6 pb-[22px]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-[11px] text-[12.5px] font-bold rounded-lg bg-white border border-[#E6E2D8] text-[#241A0F] hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-[11px] text-[12.5px] font-bold rounded-lg bg-[#B3261E] text-white hover:opacity-90 transition-opacity"
          >
            Ya, hapus koleksi
          </button>
        </div>
      </div>
    </div>
  );
}