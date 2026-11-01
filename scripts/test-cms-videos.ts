/** Isolated fixtures: never writes repository content/. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { cinemaSource, youtubeIdFromValue } from "../src/lib/video-source";

const root = process.cwd();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "itl-video-test-"));
const previousCI = process.env.CI;
try {
  const run = (script: string) => execFileSync(path.join(root, "node_modules/.bin/tsx"), [script], { cwd: tmp, env: { ...process.env, CI: "true" }, encoding: "utf8" });
  fs.mkdirSync(path.join(tmp, "scripts"));
  fs.copyFileSync(path.join(root, "scripts/relocate-content-media.mjs"), path.join(tmp, "scripts/relocate-content-media.mjs"));
  const dir = path.join(tmp, "content/videos/clip");
  fs.mkdirSync(dir, { recursive: true });
  // Arbitrary binary payload: verifies byte-for-byte copy, not codec playback.
  const bytes = Buffer.from([0, 1, 2, 3, 254, 255]);
  fs.writeFileSync(path.join(tmp, "content/videos/preview.mp4"), bytes);
  fs.writeFileSync(path.join(dir, "video.json"), JSON.stringify({ title: "Clip", previewSrc: "/media/content/videos/preview.mp4" }));
  run(path.join(tmp, "scripts/relocate-content-media.mjs"));
  const relocated = JSON.parse(fs.readFileSync(path.join(dir, "video.json"), "utf8"));
  assert.equal(relocated.previewSrc, "/media/content/videos/clip/preview.mp4");
  assert.ok(!fs.existsSync(path.join(tmp, "content/videos/preview.mp4")));
  assert.deepEqual(fs.readFileSync(path.join(dir, "preview.mp4")), bytes);
  run(path.join(root, "scripts/sync-media.ts"));
  assert.deepEqual(fs.readFileSync(path.join(tmp, "public/media/content/videos/clip/preview.mp4")), bytes);
  const youtubeDir = path.join(tmp, "content/videos/youtube");
  fs.mkdirSync(youtubeDir);
  fs.writeFileSync(path.join(youtubeDir, "video.json"), JSON.stringify({ title: "YouTube", youtubeId: "https://youtu.be/dQw4w9WgXcQ?t=10" }));
  process.chdir(tmp);
  process.env.CI = "true";
  const { loadVideos, VideoSchema } = await import("../src/lib/content");
  const videos = loadVideos();
  assert.equal(videos.length, 2);
  const clip = videos.find((video) => video.title === "Clip")!;
  assert.equal(cinemaSource(clip), "content/videos/clip/preview.mp4");
  const youtube = videos.find((video) => video.title === "YouTube")!;
  assert.equal(youtube.youtubeId, "dQw4w9WgXcQ");
  assert.equal(cinemaSource(youtube), null);
  for (const value of ["dQw4w9WgXcQ", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://youtube.com/shorts/dQw4w9WgXcQ", "https://youtube.com/live/dQw4w9WgXcQ"]) {
    assert.equal(youtubeIdFromValue(value), "dQw4w9WgXcQ");
  }
  assert.equal(youtubeIdFromValue("https://evil.example/watch?v=dQw4w9WgXcQ"), null);
  assert.equal(VideoSchema.safeParse({ title: "Bad", youtubeId: "invalid" }).success, false);
  assert.equal(cinemaSource({ src: "full.mp4", previewSrc: "preview.mp4" }), "full.mp4");
  const before = fs.readFileSync(path.join(dir, "video.json"), "utf8");
  run(path.join(tmp, "scripts/relocate-content-media.mjs"));
  assert.equal(fs.readFileSync(path.join(dir, "video.json"), "utf8"), before);
  console.log("CMS videos: relocation, idempotence, lossless copy, clip-only and YouTube-only passed");
} finally {
  process.chdir(root);
  if (previousCI === undefined) delete process.env.CI;
  else process.env.CI = previousCI;
  fs.rmSync(tmp, { recursive: true, force: true });
}
