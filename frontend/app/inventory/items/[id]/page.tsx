import Link from "next/link";
import { notFound } from "next/navigation";
import { findInventoryItem } from "@/lib/inventory";
import { StatusBadge } from "@/components/StatusBadge";

type ItemDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function ItemDetailPage({ params }: ItemDetailProps) {
  const { id } = await params;
  const item = findInventoryItem(id);

  if (!item) {
    notFound();
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Inventory Detail</p>
          <h1>{item.name}</h1>
          <p className="lead">Server-rendered detail view for a synthetic 50k-record inventory item.</p>
        </div>
        <Link className="button" href="/inventory">
          Back
        </Link>
      </header>

      <section className="panel" aria-labelledby="details-title">
        <h2 id="details-title">Item Details</h2>
        <dl className="detail-list">
          <dt>ID</dt>
          <dd>{item.id}</dd>
          <dt>Type</dt>
          <dd>{item.type}</dd>
          <dt>Status</dt>
          <dd>
            <StatusBadge status={item.status} />
          </dd>
          <dt>Last Updated</dt>
          <dd>{new Date(item.lastUpdated).toLocaleString()}</dd>
          <dt>Owner</dt>
          <dd>{item.owner}</dd>
          <dt>Environment</dt>
          <dd>{item.environment}</dd>
          <dt>Description</dt>
          <dd>{item.description}</dd>
        </dl>
      </section>
    </main>
  );
}
