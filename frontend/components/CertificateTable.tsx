import Link from "next/link";
import type { Certificate } from "@/lib/certificates";

export function CertificateTable({ certificates }: { certificates: Certificate[] }) {
  if (certificates.length === 0) {
    return <p className="empty">No certificates are stored yet.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <caption>Certificate records returned by the Rust API</caption>
        <thead>
          <tr>
            <th scope="col">Subject</th>
            <th scope="col">Issuer</th>
            <th scope="col">Expiration</th>
            <th scope="col">SAN Count</th>
            <th scope="col">Details</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((certificate) => (
            <tr key={certificate.id}>
              <th scope="row">{certificate.subject}</th>
              <td>{certificate.issuer}</td>
              <td>{new Date(certificate.expiration).toLocaleString()}</td>
              <td>{certificate.san_entries.length}</td>
              <td>
                <Link href={`/inventory/certificates/${certificate.id}`}>Open</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
