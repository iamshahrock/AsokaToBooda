#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "king-daily-qa-"));
const ledger = path.join(tmp, "ledger.json");
const input = path.join(tmp, "2026-10-07.json");

try {
  fs.copyFileSync(path.join(root, "data/king-intelligence-daily.json"), ledger);

  fs.writeFileSync(input, JSON.stringify({
    date: "2026-10-07",
    record_id: "KING-2026-10-07",
    role: "DAILY UPDATE",
    metrics: [{
      series_id: "qa_test_series",
      value: null,
      unit: "test",
      source: "Release 7 QA fixture",
      method: "synthetic validation only",
      confidence: "qa",
      status: "test"
    }]
  }, null, 2) + "\n");

  execFileSync("node", ["tools/validate-daily-update.mjs", input], { stdio: "pipe" });
  execFileSync("node", ["tools/apply-daily-update.mjs", input, ledger], { stdio: "pipe" });

  const updated = JSON.parse(fs.readFileSync(ledger, "utf8"));
  const last = updated.records.at(-1);

  if (last?.record_id !== "KING-2026-10-07") {
    throw new Error("QA append did not produce the expected final record");
  }
  if (last?.metrics?.[0]?.value !== null) {
    throw new Error("QA null-value preservation failed");
  }

  let duplicateRejected = false;
  try {
    execFileSync("node", ["tools/apply-daily-update.mjs", input, ledger], { stdio: "pipe" });
  } catch {
    duplicateRejected = true;
  }
  if (!duplicateRejected) throw new Error("Duplicate-date guard failed");

  console.log("RELEASE 7 DAILY QA PASS");
  console.log("append: PASS");
  console.log("null preservation: PASS");
  console.log("duplicate guard: PASS");
  console.log("production ledger: untouched");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
