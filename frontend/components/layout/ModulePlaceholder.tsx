import { Card } from "@/components/ui/Card";

/** Temporary body for routes owned by a teammate. Delete its usage when the real page is built. */
export function ModulePlaceholder({ name }: { name: string }) {
  return (
    <Card className="px-6 py-16 text-center">
      <h2 className="text-lg">{name}</h2>
      <p className="mt-2 text-[13px] text-ink-soft">Modul ini sedang dalam pengembangan.</p>
    </Card>
  );
}
