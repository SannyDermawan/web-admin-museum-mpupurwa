import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Table styled like the design. Wrap it in <Card> (it scrolls sideways on small screens).
 *
 *   <Table head={<><Th>Nama</Th><Th>Waktu</Th></>}>
 *     <Tr><Td>Amanda</Td><Td>09:14</Td></Tr>
 *   </Table>
 */
export function Table({ head, children }: { head?: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {head && (
          <thead>
            <tr>{head}</tr>
          </thead>
        )}
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-b border-stone-line bg-offwhite px-[22px] py-3 text-left text-[11px] font-bold tracking-[.03em] whitespace-nowrap text-ink-soft uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("group hover:bg-row-hover", className)} {...props} />;
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "border-b border-stone-line px-[22px] py-3.5 align-middle text-[13.5px] group-last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}
