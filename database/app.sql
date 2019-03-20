-- installations table

CREATE TABLE installations
(
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  url VARCHAR NOT NULL,
  token JSONB NOT NULL,
  installed TIMESTAMP NOT NULL DEFAULT NOW()
);

-- repositories table
CREATE TABLE repositories
(
  id VARCHAR PRIMARY KEY,
  installation VARCHAR NOT NULL,
  owner VARCHAR NOT NULL,
  repo VARCHAR NOT NULL,
  meta JSONB NOT NULL,
  updated TIMESTAMP NOT NULL DEFAULT NOW()
);

-- dependencies

CREATE TYPE MODE AS ENUM ('declared', 'resolved');

CREATE TABLE dependencies
(
    installation VARCHAR NOT NULL,
    repository VARCHAR NOT NULL,
    path VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    manager VARCHAR NOT NULL,
    mode MODE default 'declared',
    source TEXT NOT NULL,
    packages JSONB,
    updated TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY(installation, repository, path, type)
);

-- advisories

CREATE TABLE advisories
(
    id VARCHAR NOT NULL,
    manager VARCHAR NOT NULL,
    package VARCHAR NOT NULL,
    severity VARCHAR NOT NULL,
    cwe VARCHAR NOT NULL,
    versions VARCHAR NOT NULL,
    overview VARCHAR NOT NULL,
    recommendation VARCHAR NOT NULL,
    url VARCHAR NOT NULL,
    created TIMESTAMP NOT NULL,
    updated TIMESTAMP NOT NULL,
    PRIMARY KEY(id, manager)
);

-- trigger to update timestamps

CREATE FUNCTION updated()
    RETURNS trigger
    LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
  NEW.updated = NOW();
  RETURN NEW;
END;
$BODY$;

CREATE TRIGGER set_timestamp BEFORE UPDATE
ON repositories
FOR EACH ROW EXECUTE PROCEDURE updated();

CREATE TRIGGER set_timestamp BEFORE UPDATE
ON dependencies
FOR EACH ROW EXECUTE PROCEDURE updated();
