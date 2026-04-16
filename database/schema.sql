PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS moderation_actions;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS listing_images;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  email          TEXT    NOT NULL UNIQUE,
  password_hash  TEXT    NOT NULL,
  first_name     TEXT    NOT NULL,
  last_name      TEXT    NOT NULL,
  role           TEXT    NOT NULL CHECK (role IN ('student','moderator','admin')) DEFAULT 'student',
  status         TEXT    NOT NULL CHECK (status IN ('active','flagged','suspended')) DEFAULT 'active',
  rating         REAL    NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role    ON users(role);
CREATE INDEX idx_users_status  ON users(status);

CREATE TABLE listings (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT    NOT NULL,
  description    TEXT    NOT NULL,
  category       TEXT    NOT NULL,
  condition      TEXT    NOT NULL,
  type           TEXT    NOT NULL CHECK (type IN ('sell','trade','free')),
  price          REAL,
  status         TEXT    NOT NULL CHECK (status IN ('pending','active','completed','rejected','removed')) DEFAULT 'pending',
  view_count     INTEGER NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listings_owner    ON listings(owner_id);
CREATE INDEX idx_listings_status   ON listings(status);
CREATE INDEX idx_listings_category ON listings(category);

CREATE TABLE listing_images (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id   INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url          TEXT    NOT NULL,
  is_primary   INTEGER NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_listing_images_listing ON listing_images(listing_id);

CREATE TABLE requests (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id      INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id        INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  seller_id       INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  status          TEXT    NOT NULL CHECK (status IN ('pending','negotiating','accepted','rejected','cancelled')) DEFAULT 'pending',
  current_offer   REAL,
  offered_by      TEXT    CHECK (offered_by IN ('buyer','seller')),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_requests_listing ON requests(listing_id);
CREATE INDEX idx_requests_buyer   ON requests(buyer_id);
CREATE INDEX idx_requests_seller  ON requests(seller_id);
CREATE INDEX idx_requests_status  ON requests(status);

CREATE TABLE messages (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id    INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  sender_id     INTEGER          REFERENCES users(id)    ON DELETE SET NULL,
  body          TEXT    NOT NULL,
  message_type  TEXT    NOT NULL CHECK (message_type IN ('user','system','offer')) DEFAULT 'user',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_request ON messages(request_id);

CREATE TABLE notifications (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_id         INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  type                 TEXT    NOT NULL,
  body                 TEXT    NOT NULL,
  related_listing_id   INTEGER          REFERENCES listings(id) ON DELETE CASCADE,
  related_request_id   INTEGER          REFERENCES requests(id) ON DELETE CASCADE,
  is_read              INTEGER NOT NULL DEFAULT 0,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);

CREATE TABLE moderation_actions (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id            INTEGER          REFERENCES users(id)    ON DELETE SET NULL,
  action              TEXT    NOT NULL,
  target_user_id      INTEGER          REFERENCES users(id)    ON DELETE CASCADE,
  target_listing_id   INTEGER          REFERENCES listings(id) ON DELETE CASCADE,
  reason              TEXT,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_moderation_actor   ON moderation_actions(actor_id);
CREATE INDEX idx_moderation_user    ON moderation_actions(target_user_id);
CREATE INDEX idx_moderation_listing ON moderation_actions(target_listing_id);
