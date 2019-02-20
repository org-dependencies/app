-- trigger to update timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- repositories table
CREATE TABLE IF NOT EXISTS repositories (id VARCHAR PRIMARY KEY);

ALTER TABLE repositories ADD COLUMN IF NOT EXISTS installation VARCHAR;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS org VARCHAR;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS name VARCHAR;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS url VARCHAR;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS language VARCHAR;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS private BOOL NOT NULL DEFAULT TRUE;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS updated TIMESTAMP NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS dependencies (
  installation VARCHAR,
  org VARCHAR,
  repository VARCHAR,
  type VARCHAR,
  PRIMARY KEY(installation, org, repository, type)
);

ALTER TABLE dependencies ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE dependencies ADD COLUMN IF NOT EXISTS packages JSONB;
ALTER TABLE dependencies ADD COLUMN IF NOT EXISTS updated TIMESTAMP NOT NULL DEFAULT NOW();

-- trigger to automatically update timestamp
DROP TRIGGER IF EXISTS set_timestamp ON repositories;
DROP TRIGGER IF EXISTS set_timestamp ON dependencies;

CREATE TRIGGER set_timestamp BEFORE UPDATE ON repositories
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp BEFORE UPDATE ON dependencies
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- installations table
CREATE TABLE installations (id VARCHAR PRIMARY KEY);
ALTER TABLE installations ADD COLUMN IF NOT EXISTS name VARCHAR;
ALTER TABLE installations ADD COLUMN IF NOT EXISTS type VARCHAR;
ALTER TABLE installations ADD COLUMN IF NOT EXISTS url VARCHAR;
ALTER TABLE installations ADD COLUMN IF NOT EXISTS installed TIMESTAMP NOT NULL DEFAULT NOW();

