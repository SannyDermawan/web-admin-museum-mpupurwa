import type { CollectionItem } from "./types";

type CollectionsTableProps = {
  items: CollectionItem[];
  onEdit: (item: CollectionItem) => void;
  onDelete: (item: CollectionItem) => void;
};

/** The "Video & PDF" pill: green when complete, yellow when one is missing, red when both are. */
function MediaBadge({ status }: { status: CollectionItem["statusMedia"] }) {
  const tone =
    status === "Lengkap"
      ? "bg-[#E7F3EC] text-[#2F7D4F] border-[#C9E4D3]"
      : status === "Belum ada video dan PDF"
        ? "bg-[#FBEAE9] text-[#B3261E] border-[#F1CFCD]"
        : "bg-[#FBF3DC] text-[#8A6A1E] border-[#E9D9A8]";

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-1 rounded-full border ${tone}`}>
      {status}
    </span>
  );
}

/** Section: the table of collections, with the edit and delete buttons per row. */
export function CollectionsTable({ items, onEdit, onDelete }: CollectionsTableProps) {
  return (
    <>
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
          {items.map((row) => (
            <tr key={row.id} className="hover:bg-[#FCFBF8]">
              <td className="py-3.5 px-[22px] font-bold text-[#241A0F]">{row.nama}</td>
              <td className="py-3.5 px-[22px]">{row.era}</td>
              <td className="py-3.5 px-[22px]">{row.material}</td>
              <td className="py-3.5 px-[22px]">
                <MediaBadge status={row.statusMedia} />
              </td>
              <td className="py-3.5 px-[22px]">
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E6E2D8] text-[#7A7368] hover:text-[#241A0F] hover:bg-gray-50"
                    title="Edit"
                  >
                    <svg className="w-[15px] h-[15px] stroke-current fill-none stroke-[1.6]" viewBox="0 0 24 24">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E6E2D8] text-[#7A7368] hover:bg-[#FBEAE9] hover:border-[#F1CFCD] hover:text-[#B3261E]"
                    title="Hapus"
                  >
                    <svg className="w-[15px] h-[15px] stroke-current fill-none stroke-[1.6]" viewBox="0 0 24 24">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && (
        <div className="py-10 px-[22px] text-center text-[#7A7368] text-[13px]">
          Tidak ada koleksi yang cocok. Coba kata kunci lain.
        </div>
      )}
    </>
  );
}
