DROP TABLE IF EXISTS tenders;
CREATE TABLE tenders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  province TEXT,
  location TEXT,
  tender_deadline TEXT,             -- ISO date or NULL
  status TEXT,
  details TEXT,
  expensive_ratio REAL,
  midrange_ratio REAL,
  social_ratio REAL,
  municipality TEXT,
  winner TEXT,
  number_of_properties INTEGER,
  publication_date TEXT,            -- ISO date or NULL
  tender_longitude REAL,
  tender_latitude REAL,
  center_municipality_longitude REAL,
  center_municipality_latitude REAL
);
CREATE INDEX idx_geo ON tenders(tender_latitude, tender_longitude);
CREATE INDEX idx_muni ON tenders(municipality);