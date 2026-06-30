"use client";

import { memo, useMemo } from "react";
import useSWR from "swr";
import type { Certificate } from "@/lib/certificates";
import { countExpiringSoon, fetchCertificatesFromBrowser } from "@/lib/certificates";
import { CertificateTable } from "./CertificateTable";

export const CertificatePanel = memo(function CertificatePanel({
  initialCertificates,
}: {
  initialCertificates: Certificate[];
}) {
  const { data, isLoading } = useSWR("certificates", fetchCertificatesFromBrowser, {
    fallbackData: initialCertificates,
    refreshInterval: 30000,
  });
  const certificates = data ?? initialCertificates;
  const expiringSoon = useMemo(() => countExpiringSoon(certificates), [certificates]);

  return (
    <section className="panel" id="certificates" aria-labelledby="certificates-title">
      <div className="panel-header">
        <div>
          <h2 id="certificates-title">Certificates</h2>
          <p className="muted">Total: {certificates.length} | Expiring in 30 days: {expiringSoon}</p>
        </div>
        <span className="muted">SWR refreshes every 30 seconds</span>
      </div>
      {isLoading ? <CertificateSkeleton /> : <CertificateTable certificates={certificates} />}
    </section>
  );
});

function CertificateSkeleton() {
  return (
    <div className="skeleton-wrap" aria-label="Loading certificates">
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}
