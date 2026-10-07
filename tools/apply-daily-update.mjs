#!/usr/bin/env node
import fs from "node:fs";

const inputPath = process.argv[2];
const ledgerPath = process.argv[3] || "data/king-intelligence-daily.json";

if (!inputPath) {
  console.error("Usage: node tools/apply-daily-update.mjs <daily-input.json> [ledger.json]");
  process.exit(2);
}

const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));

const required = ["date", "record_id", "role", "metrics"];
for (const key of required) {
  if (!(key in input)) throw new Error(`Missing required field: ${key}`);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("date must be YYYY-MM-DD");
if (input.record_id !== `KING-${input.date}`) throw new Error("record_id must be KING-YYYY-MM-DD");
if (input.role !== "DAILY UPDATE") throw new Error("Only DAILY UPDATE records may be appended by this tool");
if (!Array.isArray(input.metrics) || input.metrics.length === 0) throw new Error("metrics must be a non-empty array");

const metricFields = ["series_id", "value", "unit", "source", "method", "confidence", "status"];
for (const [i, metric] of input.metrics.entries()) {
  for (const key of metricFields) {
    if (!(key in metric)) throw new Error(`metrics[${i}] missing required field: ${key}`);
  }
  if (metric.value !== null && (typeof metric.value !== "number" || !Number.isFinite(metric.value))) {
    throw new Error(`metrics[${i}].value must be a finite number or null`);
  }
}

if (!Array.isArray(ledger.records)) throw new Error("Ledger records array is missing");
if (ledger.baseline?.date !== "2026-10-04" || ledger.baseline?.immutable !== true) {
  throw new Error("Immutable 04 Oct 2026 baseline guard failed");
}
if (ledger.records.some(r => r.record_id === input.record_id)) {
  throw new Error(`Record already exists: ${input.record_id}`);
}

const latestDate = ledger.records.map(r => r.date).sort().at(-1);
if (latestDate && input.date <= latestDate) {
  throw new Error(`New record date ${input.date} must be later than existing latest record ${latestDate}`);
}

ledger.records.push(input);
ledger.records.sort((a, b) => a.date.localeCompare(b.date));

fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + "\n");
console.log(`APPENDED: ${input.record_id}`);
console.log(`ledger=${ledgerPath} records=${ledger.records.length}`);
