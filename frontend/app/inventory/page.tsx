import { CertificatePanel } from "@/components/CertificatePanel";
import { MetricGrid } from "@/components/MetricGrid";
import { VirtualInventoryTable } from "@/components/VirtualInventoryTable";
import { countExpiringSoon, getCertificates } from "@/lib/certificates";
import { getInventoryItems, parseInventoryQuery } from "@/lib/inventory";

type InventoryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;
  const query = parseInventoryQuery(params);
  const allItems = getInventoryItems();
  const certificates = await getCertificates().catch(() => []);
  const expiringSoon = countExpiringSoon(certificates);

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Certificate Inventory</p>
          <h1>Inventory Dashboard</h1>
          <p className="lead">
            Server-rendered certificate metadata from the Rust API plus a large operational inventory table.
          </p>
        </div>
        <nav className="nav" aria-label="Primary">
          <a className="button" href="#certificates">
            Certificates
          </a>
          <a className="button" href="#inventory">
            Inventory
          </a>
        </nav>
      </header>

      <MetricGrid
        metrics={[
          { label: "Certificates", value: certificates.length },
          { label: "Expiring in 30 days", value: expiringSoon },
          { label: "Inventory Records", value: allItems.length.toLocaleString() },
          { label: "Rendering Mode", value: "Virtualized" },
        ]}
      />

      <CertificatePanel initialCertificates={certificates} />

      <section className="panel" id="inventory" aria-labelledby="inventory-title">
        <div className="panel-header">
          <h2 id="inventory-title">Large Inventory</h2>
          <span className="muted">50k synthetic records, virtualized in the browser</span>
        </div>
        <VirtualInventoryTable items={allItems} initialQuery={query} />
      </section>
    </main>
  );
}
