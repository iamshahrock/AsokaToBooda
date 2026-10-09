#!/usr/bin/env node
import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node tools/validate-daily-update.mjs <daily-input.json>");
  process.exit(2);
}

const raw = fs.readFileSync(file, "utf8");
const input = JSON.parse(raw);

const required = ["date", "record_id", "role", "metrics"];
for (const key of required) {
  if (!(key in input)) throw new Error(`Missing required field: ${key}`);
}

if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
  throw new Error("date must be YYYY-MM-DD");
}

if (input.record_id !== `KING-${input.date}`) {
  throw new Error("record_id must be KING-YYYY-MM-DD");
}

if (!["DAILY UPDATE", "BASELINE"].includes(input.role)) {
  throw new Error("role must be DAILY UPDATE or BASELINE");
}

if (!Array.isArray(input.metrics) || input.metrics.length === 0) {
  throw new Error("metrics must be a non-empty array");
}

const requiredMetricFields = ["series_id", "value", "unit", "source", "method", "confidence", "status"];
for (const [i, metric] of input.metrics.entries()) {
  for (const key of requiredMetricFields) {
    if (!(key in metric)) throw new Error(`metrics[${i}] missing required field: ${key}`);
  }
  if (metric.value !== null && (typeof metric.value !== "number" || !Number.isFinite(metric.value))) {
    throw new Error(`metrics[${i}].value must be a finite number or null`);
  }
  if (typeof metric.series_id !== "string" || !metric.series_id.trim()) {
    throw new Error(`metrics[${i}].series_id must be a non-empty string`);
  }
}

if (input.role === "BASELINE" && input.date !== "2026-10-04") {
  throw new Error("Only 2026-10-04 may be the BASELINE record");
}

console.log(`VALID DAILY RECORD: ${input.record_id}`);
console.log(`date=${input.date} metrics=${input.metrics.length}`);
