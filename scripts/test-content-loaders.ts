/** Regression: CMS media-only folders are unpublished, invalid JSON still fails CI. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const originalCwd = process.cwd();
const originalCI = process.env.CI;
const originalAllow = process.env.ITL_ALLOW_INVALID_CONTENT;
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "itl-content-test-"));
process.chdir(fixture);
process.env.CI = "true";
delete process.env.ITL_ALLOW_INVALID_CONTENT;

try {
  const { loadShows, loadTracks, loadVideos } = await import("../src/lib/content");
  // CONTENT_DIR is resolved at import time, so load the module after chdir.
  const { CONTENT_DIR } = await import("../src/lib/content-fs");
  assert.equal(CONTENT_DIR, path.join(fixture, "content"));
  for (const [kind, jsonName, loader, valid] of [
    ["shows", "show.json", loadShows, { venue: "Test", date: "2026-10-31" }],
    ["songs", "track.json", loadTracks, { title: "Test" }],
    ["videos", "video.json", loadVideos, { title: "Test" }],
  ] as const) {
    const dir = path.join(fixture, "content", kind, "cms-item");
    fs.mkdirSync(dir, { recursive: true });
    const media = path.join(dir, "upload.txt");
    fs.writeFileSync(media, "retained media");
    assert.deepEqual(loader(), []);
    assert.ok(fs.existsSync(media));
    const json = path.join(dir, jsonName);
    fs.writeFileSync(json, "{broken");
    assert.throws(() => loader(), /Contenido inválido/);
    fs.writeFileSync(json, JSON.stringify({ title: 42, venue: 42 }));
    assert.throws(() => loader(), /Contenido inválido/);
    fs.writeFileSync(json, JSON.stringify(valid));
    assert.equal(loader().length, 1);
    fs.rmSync(dir, { recursive: true });
  }
  console.log("Content loader regression tests passed");
} finally {
  process.chdir(originalCwd);
  if (originalCI === undefined) delete process.env.CI;
  else process.env.CI = originalCI;
  if (originalAllow === undefined) delete process.env.ITL_ALLOW_INVALID_CONTENT;
  else process.env.ITL_ALLOW_INVALID_CONTENT = originalAllow;
  fs.rmSync(fixture, { recursive: true, force: true });
}
