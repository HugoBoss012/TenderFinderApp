const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const db = require('./db');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

const csvPath = path.join(__dirname, 'data', 'full_stack_case_data.csv');
if (!fs.existsSync(csvPath)) {
  console.error('CSV not found at server/data/full_stack_case_data.csv');
  process.exit(1);
}

const insert = db.prepare(`INSERT INTO tenders (
  province, location, tender_deadline, status, details,
  expensive_ratio, midrange_ratio, social_ratio, municipality, winner,
  number_of_properties, publication_date,
  tender_longitude, tender_latitude,
  center_municipality_longitude, center_municipality_latitude
) VALUES (@province, @location, @tender_deadline, @status, @details,
  @expensive_ratio, @midrange_ratio, @social_ratio, @municipality, @winner,
  @number_of_properties, @publication_date,
  @tender_longitude, @tender_latitude,
  @center_municipality_longitude, @center_municipality_latitude)`);

const tx = db.transaction(rows => {
  for (const r of rows) insert.run(r);
});

const rows = [];
fs.createReadStream(csvPath)
  .pipe(parse({ columns: true, skip_empty_lines: true }))
  .on('data', (rec) => {
    const toNum = (v) => (v === '' || v == null ? null : Number(v));
    const toInt = (v) => (v === '' || v == null ? null : parseInt(v, 10));
    const toStr = (v) => (v == null ? null : String(v));

    rows.push({
      province: toStr(rec.province),
      location: toStr(rec.location),
      tender_deadline: toStr(rec.tender_deadline) || null,
      status: toStr(rec.status),
      details: toStr(rec.details),
      expensive_ratio: toNum(rec.expensive_ratio),
      midrange_ratio: toNum(rec.midrange_ratio),
      social_ratio: toNum(rec.social_ratio),
      municipality: toStr(rec.municipality),
      winner: toStr(rec.winner),
      number_of_properties: toInt(rec.number_of_properties),
      publication_date: toStr(rec.publication_date) || null,
      tender_longitude: toNum(rec.tender_longitude),
      tender_latitude: toNum(rec.tender_latitude),
      center_municipality_longitude: toNum(rec.center_municipality_longitude),
      center_municipality_latitude: toNum(rec.center_municipality_latitude)
    });
  })
  .on('end', () => {
    tx(rows);
    console.log(`Imported ${rows.length} rows.`);
  })
  .on('error', (e) => {
    console.error(e);
    process.exit(1);
  });