CREATE TABLE hiking_rsvps (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  attendance TEXT NOT NULL CHECK (attendance IN ('yes', 'no')),
  participant_count INTEGER NOT NULL DEFAULT 0 CHECK (participant_count >= 0 AND participant_count <= 10),
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hiking_rsvps_created_at ON hiking_rsvps(created_at DESC);
CREATE INDEX idx_hiking_rsvps_attendance ON hiking_rsvps(attendance);