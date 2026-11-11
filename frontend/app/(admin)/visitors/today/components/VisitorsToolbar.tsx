import { Button } from "@/components/ui/Button";
import { CalendarIcon } from "@/components/ui/icons";
import { SearchField } from "@/components/ui/SearchField";
import { formatDateLong } from "@/lib/utils";

type VisitorsToolbarProps = {
  /** ISO date of the list, undefined while the data is still loading */
  date?: string;
  search: string;
  onSearchChange: (value: string) => void;
  onDownload: () => void;
  downloadDisabled: boolean;
};

/** Section: date label on the left, search box and CSV button on the right. */
export function VisitorsToolbar({ date, search, onSearchChange, onDownload, downloadDisabled }: VisitorsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-stone-line px-[22px] py-4">
      {date ? (
        <div className="flex items-center gap-2 rounded-lg border border-stone-line px-3 py-2 text-[13px] font-semibold">
          <CalendarIcon className="size-[15px] text-ink-soft" />
          {formatDateLong(date)}
        </div>
      ) : (
        <div />
      )}
      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2.5">
        <SearchField
          value={search}
          onChange={onSearchChange}
          label="Cari pengunjung"
          placeholder="Cari nama, domisili, atau institusi..."
        />
        <Button variant="outline" onClick={onDownload} disabled={downloadDisabled}>
          Unduh CSV
        </Button>
      </div>
    </div>
  );
}
