CREATE TABLE IF NOT EXISTS drops (
  id TEXT PRIMARY KEY,
  title VARCHAR(80) NOT NULL,
  summary VARCHAR(220) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('ACCOUNTS', 'METHODS', 'TOOLS', 'OTHER')),
  attachment_url TEXT,
  attachment_name VARCHAR(180),
  attachment_type VARCHAR(120),
  creator_discord_id VARCHAR(32) NOT NULL,
  creator_name VARCHAR(120) NOT NULL,
  creator_avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS drops_category_created_at_idx ON drops (category, created_at DESC);
CREATE INDEX IF NOT EXISTS drops_creator_discord_id_idx ON drops (creator_discord_id);
