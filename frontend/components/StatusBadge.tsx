import type { InventoryStatus } from "@/lib/inventory";

export function StatusBadge({ status }: { status: InventoryStatus }) {
  return <span className={`status ${status.toLowerCase()}`}>{status}</span>;
}
