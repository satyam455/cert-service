export type Certificate = {
  id: string;
  subject: string;
  expiration: string;
  issuer: string;
  san_entries: string[];
};

const apiBaseUrl = process.env.CERT_API_URL ?? "http://localhost:8080";

export const certificateApiPath = "/certificates";

export async function getCertificates(): Promise<Certificate[]> {
  const response = await fetch(`${apiBaseUrl}/certificates`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Certificate API returned ${response.status}`);
  }

  return response.json();
}

export async function fetchCertificatesFromBrowser(): Promise<Certificate[]> {
  const response = await fetch("/api/certificates");

  if (!response.ok) {
    throw new Error(`Certificate API returned ${response.status}`);
  }

  return response.json();
}

export async function getCertificate(id: string): Promise<Certificate | null> {
  const response = await fetch(`${apiBaseUrl}/certificates/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Certificate API returned ${response.status}`);
  }

  return response.json();
}

export function countExpiringSoon(certificates: Certificate[], now = new Date()): number {
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + 30);

  return certificates.filter((certificate) => {
    const expiration = new Date(certificate.expiration);
    return expiration > now && expiration <= windowEnd;
  }).length;
}
