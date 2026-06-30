use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    routing::get,
};
use sqlx::PgPool;
use tower_http::trace::TraceLayer;
use uuid::Uuid;

use crate::{
    db,
    error::AppError,
    models::{Certificate, CreateCertificate, ParseCertificateRequest},
    parser,
    state::AppState,
};

pub fn app(db: PgPool) -> Router {
    Router::new()
        .route("/health", get(health))
        .route(
            "/certificates",
            get(list_certificates).post(create_certificate),
        )
        .route("/certificates/parse", axum::routing::post(parse_certificate))
        .route("/certificates/:id", get(get_certificate))
        .layer(TraceLayer::new_for_http())
        .with_state(AppState { db })
}

async fn health() -> &'static str {
    "ok"
}

async fn list_certificates(
    State(state): State<AppState>,
) -> Result<Json<Vec<Certificate>>, AppError> {
    let certs = db::list_certificates(&state.db).await?;
    Ok(Json(certs))
}

async fn create_certificate(
    State(state): State<AppState>,
    Json(input): Json<CreateCertificate>,
) -> Result<(StatusCode, Json<Certificate>), AppError> {
    let cert = db::insert_certificate(&state.db, input).await?;
    Ok((StatusCode::CREATED, Json(cert)))
}

async fn get_certificate(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Certificate>, AppError> {
    let id = Uuid::parse_str(&id)
        .map_err(|_| AppError::BadRequest("invalid certificate id".into()))?;
    let cert = db::find_certificate(&state.db, id).await?;
    Ok(Json(cert))
}

async fn parse_certificate(
    Json(input): Json<ParseCertificateRequest>,
) -> Result<Json<CreateCertificate>, AppError> {
    Ok(Json(parser::parse_certificate_metadata(input)?))
}
