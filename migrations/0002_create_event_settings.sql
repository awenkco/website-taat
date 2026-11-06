CREATE TABLE taat_event_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  activity_type TEXT NOT NULL DEFAULT 'Hiking',
  activity_description TEXT NOT NULL DEFAULT 'Jelajah alam Gunung Sangar bersama TAAT.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO taat_event_settings (id, activity_type, activity_description)
VALUES (1, 'Hiking', 'Jelajah alam Gunung Sangar bersama TAAT.');