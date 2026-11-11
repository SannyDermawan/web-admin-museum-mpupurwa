import React from "react";

type CollectionsToolbarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
};

/** Section: search box and the "+ Tambah Koleksi" button. */
export function CollectionsToolbar({ searchQuery, onSearchChange, onAdd }: CollectionsToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 px-[22px] border-b border-[#E6E2D8] gap-3.5">
      <div className="flex items-center gap-2 bg-[#F7F5F0] border border-[#E6E2D8] rounded-[9px] px-3.5 py-2 w-[280px]">
        <svg className="w-[15px] h-[15px] stroke-[#7A7368] fill-none stroke-[1.7] flex-shrink-0" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Cari koleksi..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          className="bg-transparent border-none outline-none text-[13px] w-full text-[#241A0F]"
        />
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="bg-[#D4AF37] text-[#1F1F1F] font-bold text-[12.5px] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
      >
        + Tambah Koleksi
      </button>
    </div>
  );
}
