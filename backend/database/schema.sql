-- =============================================
-- Nyxgram Database Schema (PostgreSQL)
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Пользователи
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(11) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT NULL,
    bio VARCHAR(200) DEFAULT '',
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    is_verified BOOLEAN DEFAULT FALSE,
    balance BIGINT DEFAULT 1000,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away', 'busy')),
    last_seen TIMESTAMPTZ DEFAULT NULL,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);

-- Чаты
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('private', 'group')),
    name VARCHAR(64) DEFAULT NULL,
    avatar VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Участники чатов
CREATE TABLE chat_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_muted BOOLEAN DEFAULT FALSE,
    unread_count INT DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (chat_id, user_id)
);

CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX idx_chat_participants_chat ON chat_participants(chat_id);

-- Сообщения
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL DEFAULT 'text',
    content TEXT DEFAULT '',
    reply_to_id UUID DEFAULT NULL REFERENCES messages(id),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_chat ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Вложения
CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    url VARCHAR(500) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    width INT DEFAULT NULL,
    height INT DEFAULT NULL,
    duration FLOAT DEFAULT NULL,
    thumbnail VARCHAR(500) DEFAULT NULL,
    waveform JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_message ON message_attachments(message_id);

-- Реакции
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    emoji VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (message_id, user_id, emoji)
);

-- Подарки
CREATE TABLE gifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    image VARCHAR(500) NOT NULL,
    price BIGINT NOT NULL,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('card', 'collectible', 'decoration', 'special')),
    is_limited BOOLEAN DEFAULT FALSE,
    max_supply INT DEFAULT NULL,
    current_supply INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gifts_category ON gifts(category);
CREATE INDEX idx_gifts_rarity ON gifts(rarity);

-- Подарки пользователей
CREATE TABLE user_gifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gift_id UUID NOT NULL REFERENCES gifts(id),
    from_user_id UUID NOT NULL REFERENCES users(id),
    to_user_id UUID NOT NULL REFERENCES users(id),
    message VARCHAR(200) DEFAULT '',
    is_displayed BOOLEAN DEFAULT TRUE,
    received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_gifts_to ON user_gifts(to_user_id);

-- Транзакции
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gift_id UUID NOT NULL REFERENCES gifts(id),
    gift_name VARCHAR(100) NOT NULL,
    gift_image VARCHAR(500) NOT NULL,
    from_user_id UUID NOT NULL REFERENCES users(id),
    from_username VARCHAR(11) NOT NULL,
    to_user_id UUID NOT NULL REFERENCES users(id),
    to_username VARCHAR(11) NOT NULL,
    price BIGINT NOT NULL,
    message VARCHAR(200) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_from ON transactions(from_user_id, created_at DESC);
CREATE INDEX idx_transactions_to ON transactions(to_user_id, created_at DESC);

-- Баны
CREATE TABLE bans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    username VARCHAR(11) NOT NULL,
    reason TEXT NOT NULL,
    banned_by UUID NOT NULL REFERENCES users(id),
    banned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_bans_user ON bans(user_id, is_active);
