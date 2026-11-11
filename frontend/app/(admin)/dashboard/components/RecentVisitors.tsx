import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/PageState";
import { Table, Td, Tr } from "@/components/ui/Table";
import { TextLink } from "@/components/ui/TextLink";
import type { Visitor } from "@/types";

/** Section: "Pengunjung Terbaru", the latest check-ins of today. */
export function RecentVisitors({ visitors }: { visitors: Visitor[] }) {
  return (
    <Card>
      <CardHeader title="Pengunjung Terbaru" action={<TextLink tone="charcoal" href="/visitors/today">Lihat semua</TextLink>} />
      <div className="py-1.5">
        {visitors.length === 0 ? (
          <EmptyState message="Belum ada pengunjung hari ini." />
        ) : (
          <Table>
            {visitors.map((visitor) => (
              <Tr key={visitor.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={visitor.name} />
                    <div>
                      <div className="font-bold">{visitor.name}</div>
                      <div className="mt-0.5 text-xs text-ink-soft">{`${visitor.domicile} · ${visitor.educationLevel}`}</div>
                    </div>
                  </div>
                </Td>
                <Td className="text-right text-ink-soft">{visitor.checkInTime}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </div>
    </Card>
  );
}
