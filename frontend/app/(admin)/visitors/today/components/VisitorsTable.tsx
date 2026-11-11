import { Avatar } from "@/components/ui/Avatar";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import type { Visitor } from "@/types";

/** Column titles, also used as the header row of the CSV download. */
export const VISITOR_COLUMNS = ["Pengunjung", "Domisili", "Asal Sekolah / Institusi", "Tingkat Pendidikan", "Waktu Check-in"];

/** Section: the table of today's check-ins. */
export function VisitorsTable({ visitors }: { visitors: Visitor[] }) {
  return (
    <Table
      head={VISITOR_COLUMNS.map((column) => (
        <Th key={column}>{column}</Th>
      ))}
    >
      {visitors.map((visitor) => (
        <Tr key={visitor.id}>
          <Td>
            <div className="flex items-center gap-2.5">
              <Avatar name={visitor.name} />
              <span className="font-bold">{visitor.name}</span>
            </div>
          </Td>
          <Td>{visitor.domicile}</Td>
          <Td>{visitor.institution ?? "—"}</Td>
          <Td>{visitor.educationLevel}</Td>
          <Td>{visitor.checkInTime}</Td>
        </Tr>
      ))}
    </Table>
  );
}
