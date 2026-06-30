import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell">
      <section className="panel">
        <h1>Record not found</h1>
        <p className="lead">The requested inventory record does not exist.</p>
        <Link className="button primary" href="/inventory">
          Back to inventory
        </Link>
      </section>
    </main>
  );
}
