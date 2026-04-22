-- Rebuild historian_rating so it can link to an event, person, or source
-- (at least one of the three must be set). Preserves existing rows.

CREATE TABLE historian_rating_new (
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
  source_id           INTEGER,
  event_id            INTEGER,
  person_id           INTEGER,
  FOREIGN KEY (historian_id) REFERENCES historian(id),
  FOREIGN KEY (source_id)    REFERENCES source(id),
  FOREIGN KEY (event_id)     REFERENCES event(id),
  FOREIGN KEY (person_id)    REFERENCES person(id),
  CHECK (source_id IS NOT NULL OR event_id IS NOT NULL OR person_id IS NOT NULL)
);

INSERT INTO historian_rating_new (
  id, source_cardinality, historical_distance, context, corroboration,
  internal_criticism, external_criticism, bias_notes, confidence_score,
  rating_date, historian_id, source_id
)
SELECT
  id, source_cardinality, historical_distance, context, corroboration,
  internal_criticism, external_criticism, bias_notes, confidence_score,
  rating_date, historian_id, source_id
FROM historian_rating;

DROP TABLE historian_rating;
ALTER TABLE historian_rating_new RENAME TO historian_rating;

CREATE INDEX idx_historian_rating_source   ON historian_rating(source_id);
CREATE INDEX idx_historian_rating_event    ON historian_rating(event_id);
CREATE INDEX idx_historian_rating_person   ON historian_rating(person_id);
CREATE INDEX idx_historian_rating_historian ON historian_rating(historian_id);
