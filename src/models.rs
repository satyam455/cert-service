use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateCertificate {
    pub subject: String,
    pub expiration: DateTime<Utc>,
    pub issuer: String,
    #[serde(default)]
    pub san_entries: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct ParseCertificateRequest {
    pub pem: String,
}

#[derive(Debug, Serialize)]
pub struct Certificate {
    pub id: Uuid,
    pub subject: String,
    pub expiration: DateTime<Utc>,
    pub issuer: String,
    pub san_entries: Vec<String>,
}

#[derive(Debug, sqlx::FromRow)]
pub struct CertificateRow {
    pub id: Uuid,
    pub subject: String,
    pub expiration: DateTime<Utc>,
    pub issuer: String,
    pub san_entries: Vec<String>,
}

impl CertificateRow {
    pub fn into_certificate(self) -> Certificate {
        Certificate {
            id: self.id,
            subject: self.subject,
            expiration: self.expiration,
            issuer: self.issuer,
            san_entries: self.san_entries,
        }
    }
}
