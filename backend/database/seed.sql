-- Seed дефолтного админа
INSERT INTO users (username, password_hash, role, is_verified, balance)
VALUES (
    'MaksimXyila',
    '$2a$12$placeholder_hash_replace_on_startup',
    'admin',
    TRUE,
    99999999
) ON CONFLICT (username) DO NOTHING;
