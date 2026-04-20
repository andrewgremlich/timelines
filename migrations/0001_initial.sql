CREATE TABLE user (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE session (
  id         TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE rate_limit (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  key          TEXT NOT NULL,
  attempted_at TEXT NOT NULL
);

CREATE INDEX idx_rate_limit_key ON rate_limit(key);

CREATE TABLE location (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  historical_name TEXT,
  region          TEXT,
  country         TEXT,
  latitude        REAL,
  longitude       REAL
);

CREATE TABLE event (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT,
  start_date  TEXT NOT NULL,
  end_date    TEXT,
  location_id INTEGER,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (location_id) REFERENCES location(id)
);

CREATE TABLE event_image (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  url      TEXT NOT NULL,
  caption  TEXT,
  alt_text TEXT,
  event_id INTEGER NOT NULL,
  FOREIGN KEY (event_id) REFERENCES event(id)
);

CREATE TABLE tag (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE event_to_tag (
  event_id INTEGER NOT NULL,
  tag_id   INTEGER NOT NULL,
  PRIMARY KEY (event_id, tag_id),
  FOREIGN KEY (event_id) REFERENCES event(id),
  FOREIGN KEY (tag_id)   REFERENCES tag(id)
);

CREATE TABLE person (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  birth_date  TEXT,
  death_date  TEXT,
  nationality TEXT,
  occupation  TEXT,
  biography   TEXT
);

CREATE TABLE person_to_event (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL,
  event_id  INTEGER NOT NULL,
  role      TEXT,
  UNIQUE (person_id, event_id),
  FOREIGN KEY (person_id) REFERENCES person(id),
  FOREIGN KEY (event_id)  REFERENCES event(id)
);

CREATE TABLE source (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title            TEXT NOT NULL,
  author           TEXT,
  publication_date TEXT,
  url              TEXT,
  citation         TEXT,
  source_type      TEXT NOT NULL CHECK (source_type IN ('PRIMARY', 'SECONDARY', 'TERTIARY'))
);

CREATE TABLE source_to_event (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL,
  event_id  INTEGER NOT NULL,
  UNIQUE (source_id, event_id),
  FOREIGN KEY (source_id) REFERENCES source(id),
  FOREIGN KEY (event_id)  REFERENCES event(id)
);

CREATE TABLE historian (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  credentials TEXT,
  nationality TEXT,
  era         TEXT
);

CREATE TABLE historian_rating (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  source_cardinality  INTEGER,
  historical_distance INTEGER,
  context             TEXT,
  corroboration       INTEGER,
  internal_criticism  TEXT,
  external_criticism  TEXT,
  bias_notes          TEXT,
  confidence_score    REAL,
  rating_date         TEXT DEFAULT (datetime('now')),
  historian_id        INTEGER NOT NULL,
  source_id           INTEGER NOT NULL,
  FOREIGN KEY (historian_id) REFERENCES historian(id),
  FOREIGN KEY (source_id)    REFERENCES source(id)
);
