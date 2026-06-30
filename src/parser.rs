use std::io::Cursor;

use chrono::{DateTime, Utc};
use x509_parser::{
    extensions::GeneralName,
    prelude::{FromDer, Pem, X509Certificate},
};

use crate::{
    error::AppError,
    models::{CreateCertificate, ParseCertificateRequest},
};

pub fn parse_certificate_metadata(
    req: ParseCertificateRequest,
) -> Result<CreateCertificate, AppError> {
    let mut reader = Cursor::new(req.pem.into_bytes());
    let (pem, _) = Pem::read(&mut reader)
        .map_err(|_| AppError::BadRequest("not a valid PEM certificate".into()))?;
    let (_, certificate) = X509Certificate::from_der(&pem.contents)
        .map_err(|_| AppError::BadRequest("failed to parse certificate DER".into()))?;

    let subject = common_name(certificate.subject()).unwrap_or_else(|| certificate.subject().to_string());
    let issuer = common_name(certificate.issuer()).unwrap_or_else(|| certificate.issuer().to_string());
    let expiration = DateTime::<Utc>::from_timestamp(
        certificate.validity().not_after.to_datetime().unix_timestamp(), 0,
    ).ok_or_else(|| AppError::BadRequest("expiration out of range".into()))?;
    let san_entries = certificate
        .subject_alternative_name()
        .map_err(|_| AppError::BadRequest("couldn't parse SAN extension".into()))?
        .map(|extension| {
            extension
                .value
                .general_names
                .iter()
                .filter_map(|name| match name {
                    GeneralName::DNSName(value) => Some(value.to_string()),
                    GeneralName::IPAddress(value) => Some(format_ip_address(value)),
                    _ => None,
                })
                .collect()
        })
        .unwrap_or_default();

    Ok(CreateCertificate {
        subject,
        expiration,
        issuer,
        san_entries,
    })
}

fn common_name(name: &x509_parser::x509::X509Name<'_>) -> Option<String> {
    name.iter_common_name()
        .next()
        .and_then(|attribute| attribute.as_str().ok())
        .map(ToOwned::to_owned)
}

fn format_ip_address(bytes: &[u8]) -> String {
    match bytes {
        [a, b, c, d] => format!("{a}.{b}.{c}.{d}"),
        _ => bytes
            .chunks(2)
            .map(|chunk| {
                let high = chunk.first().copied().unwrap_or_default();
                let low = chunk.get(1).copied().unwrap_or_default();
                format!("{:02x}{:02x}", high, low)
            })
            .collect::<Vec<_>>()
            .join(":"),
    }
}

#[cfg(test)]
mod tests {
    use super::format_ip_address;

    #[test]
    fn formats_ipv4_san_values() {
        assert_eq!(format_ip_address(&[127, 0, 0, 1]), "127.0.0.1");
    }

    #[test]
    fn formats_ipv6_san_values() {
        let bytes = [0x20, 0x01, 0x0d, 0xb8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
        assert_eq!(format_ip_address(&bytes), "2001:0db8:0000:0000:0000:0000:0000:0001");
    }
}
