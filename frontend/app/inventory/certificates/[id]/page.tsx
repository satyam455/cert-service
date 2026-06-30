import Link from "next/link";
import { notFound } from "next/navigation";
import { getCertificate } from "@/lib/certificates";

type CertificateDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function CertificateDetailPage({ params }: CertificateDetailProps) {
  const { id } = await params;
  const certificate = await getCertificate(id);

  if (!certificate) {
    notFound();
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Certificate Detail</p>
          <h1>{certificate.subject}</h1>
          <p className="lead">Metadata returned by the Rust certificate API.</p>
        </div>
        <Link className="button" href="/inventory">
          Back
        </Link>
      </header>

      <section className="panel" aria-labelledby="details-title">
        <h2 id="details-title">Certificate Metadata</h2>
        <dl className="detail-list">
          <dt>ID</dt>
          <dd>{certificate.id}</dd>
          <dt>Issuer</dt>
          <dd>{certificate.issuer}</dd>
          <dt>Expiration</dt>
          <dd>{new Date(certificate.expiration).toLocaleString()}</dd>
          <dt>SAN Entries</dt>
          <dd>
            {certificate.san_entries.length > 0 ? (
              <div className="chips">
                {certificate.san_entries.map((entry) => (
                  <span className="chip" key={entry}>
                    {entry}
                  </span>
                ))}
              </div>
            ) : (
              <span className="muted">None</span>
            )}
          </dd>
        </dl>
      </section>
    </main>
  );
}
