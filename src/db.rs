use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    error::AppError,
    models::{Certificate, CertificateRow, CreateCertificate},
};

pub async fn list_certificates(pool: &PgPool) -> Result<Vec<Certificate>, AppError> {
    let rows = sqlx::query_as::<_, CertificateRow>(
        r#"
        select id, subject, expiration, issuer, san_entries
        from certificates
        order by created_at desc
        limit 100
        "#, // 100 is a reasonable cap until pagination is added
    )
    .fetch_all(pool)
    .await?;

    Ok(rows.into_iter().map(|r| r.into_certificate()).collect())
}

pub async fn insert_certificate(
    pool: &PgPool,
    input: CreateCertificate,
) -> Result<Certificate, AppError> {
    validate_certificate(&input)?;

    let id = Uuid::new_v4();
    let subject = input.subject.trim().to_string();
    let issuer = input.issuer.trim().to_string();
    let san_entries = clean_sans(input.san_entries);

    let row = sqlx::query_as::<_, CertificateRow>(
        r#"
        insert into certificates (id, subject, expiration, issuer, san_entries)
        values ($1, $2, $3, $4, $5)
        returning id, subject, expiration, issuer, san_entries
        "#,
    )
    .bind(id)
    .bind(subject)
    .bind(input.expiration)
    .bind(issuer)
    .bind(san_entries)
    .fetch_one(pool)
    .await?;

    Ok(row.into_certificate())
}

pub async fn find_certificate(pool: &PgPool, id: Uuid) -> Result<Certificate, AppError> {
    let row = sqlx::query_as::<_, CertificateRow>(
        r#"
        select id, subject, expiration, issuer, san_entries
        from certificates
        where id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(row.into_certificate())
}

pub fn validate_certificate(input: &CreateCertificate) -> Result<(), AppError> {
    if input.subject.trim().is_empty() {
        return Err(AppError::BadRequest("subject can't be empty".into()));
    }

    if input.issuer.trim().is_empty() {
        return Err(AppError::BadRequest("issuer is required".into()));
    }

    if input.expiration <= Utc::now() {
        return Err(AppError::BadRequest(
            "expiration must be in the future".into(),
        ));
    }

    Ok(())
}

pub fn clean_sans(sans: Vec<String>) -> Vec<String> {
    sans.into_iter()
        .map(|entry| entry.trim().to_string())
        .filter(|entry| !entry.is_empty())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Duration;

    fn sample_input() -> CreateCertificate {
        CreateCertificate {
            subject: "api.example.com".into(),
            expiration: Utc::now() + Duration::days(30),
            issuer: "Example CA".into(),
            san_entries: vec!["www.example.com".into()],
        }
    }

    #[test]
    fn validation_accepts_complete_metadata() {
        let input = sample_input();
        assert!(validate_certificate(&input).is_ok());
    }

    #[test]
    fn validation_rejects_empty_subject() {
        let mut input = sample_input();
        input.subject = "   ".into();
        assert!(validate_certificate(&input).is_err());
    }

    #[test]
    fn clean_sans_removes_empty_values() {
        let sans = clean_sans(vec![" a.example.com ".into(), "".into(), "  ".into()]);
        assert_eq!(sans, vec!["a.example.com"]);
    }
}
