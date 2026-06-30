create table if not exists certificates (
    id uuid primary key,
    subject text not null,
    expiration timestamptz not null,
    issuer text not null,
    san_entries text[] not null default '{}',
    created_at timestamptz not null default now()
);

create index if not exists certificates_subject_idx on certificates (subject);
create index if not exists certificates_expiration_idx on certificates (expiration);
