const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { randomUUID } = require("node:crypto");
const ts = require("typescript");

function scriptService() {
  class Sheet {
    constructor(headers) { this.rows = [headers]; }
    getLastRow() { return this.rows.length; }
    getMaxRows() { return 1000; }
    getRange(row, column, height = 1, width = 1) {
      const range = {
        getValues: () => Array.from({ length: height }, (_, i) => Array.from({ length: width }, (_, j) => this.rows[row - 1 + i]?.[column - 1 + j] ?? "")),
        setValues: (values) => { values.forEach((line, i) => { this.rows[row - 1 + i] ??= []; line.forEach((value, j) => { this.rows[row - 1 + i][column - 1 + j] = value; }); }); return range; },
        setValue: (value) => range.setValues([[value]]),
        setRichTextValue: (value) => range.setValue(value.text),
        setNumberFormat: () => range,
      };
      return range;
    }
    deleteRow(row) { this.rows.splice(row - 1, 1); }
  }
  const comments = new Sheet(["id", "name", "text", "createdAt", "status", "readerHash"]);
  const likes = new Sheet(["commentId", "readerHash"]);
  const secret = "test-secret-".repeat(4);
  const hash = "a".repeat(64);
  const context = vm.createContext({
    PropertiesService: { getScriptProperties: () => ({ getProperty: (key) => key === "COMMENTS_SECRET" ? secret : "sheet-id" }) },
    SpreadsheetApp: {
      openById: () => ({ getSheetByName: (name) => name === "Comments" ? comments : likes }),
      flush: () => {},
      newRichTextValue: () => { const builder = { setText: (text) => { builder.text = text; return builder; }, build: () => ({ text: builder.text }) }; return builder; },
    },
    Utilities: { getUuid: randomUUID },
    LockService: { getScriptLock: () => ({ tryLock: () => true, hasLock: () => true, releaseLock: () => {} }) },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: (text) => ({ setMimeType: () => JSON.parse(text) }) },
  });
  vm.runInContext(fs.readFileSync("google-apps-script/Code.gs", "utf8"), context);
  return {
    comments, likes,
    call: (body) => context.doPost({ postData: { contents: JSON.stringify({ secret, readerHash: hash, ...body }) } }),
  };
}

test("script rejects unauthorized and invalid input without storing rows", () => {
  const service = scriptService();
  assert.equal(service.call({ action: "create", secret: "wrong", name: "Name", text: "Test" }).code, "UNAUTHORIZED");
  assert.equal(service.call({ action: "create", name: "Name", text: " " }).code, "INVALID_INPUT");
  assert.equal(service.call({ action: "create", name: "Name", text: "x".repeat(2001) }).code, "INVALID_INPUT");
  assert.equal(service.call({ action: "list", readerHash: "not-a-hash" }).code, "INVALID_INPUT");
  assert.equal(service.comments.rows.length, 1);
});

test("real comments persist as literal text and remain private until approved", () => {
  const service = scriptService();
  assert.equal(service.call({ action: "create", name: "=1+1", text: '=IMPORTXML("example", "data")' }).ok, true);
  assert.equal(service.comments.rows[1][1], "=1+1");
  assert.equal(service.comments.rows[1][4], "pending");
  assert.equal(service.call({ action: "list" }).total, 0);
  const id = service.comments.rows[1][0];
  assert.equal(service.call({ action: "like", id, liked: true }).code, "NOT_FOUND");
  service.comments.rows[1][4] = "approved";
  const result = service.call({ action: "list" });
  assert.equal(result.total, 1);
  assert.equal(result.comments[0].text, '=IMPORTXML("example", "data")');
  assert.equal("readerHash" in result.comments[0], false);
  service.comments.rows[1][4] = "rejected";
  assert.equal(service.call({ action: "list" }).total, 0);
});

test("sheet-backed cooldown and daily limit survive subsequent calls", () => {
  const service = scriptService();
  const body = { action: "create", name: "Bạn đọc", text: "Nội dung thật" };
  assert.equal(service.call(body).ok, true);
  assert.equal(service.call(body).code, "RATE_LIMIT");
  service.comments.rows[1][3] = new Date(Date.now() - 120000);
  assert.equal(service.call(body).ok, true);
  service.comments.rows[2][3] = new Date(Date.now() - 120000);
  for (let i = 0; i < 8; i++) service.comments.rows.push([...service.comments.rows[1], randomUUID()].slice(0, 6));
  assert.equal(service.call(body).code, "RATE_LIMIT");
});

test("likes persist, repeated desired state is idempotent, and readers are independent", () => {
  const service = scriptService();
  service.call({ action: "create", name: "A", text: "B" });
  service.comments.rows[1][4] = "approved";
  const id = service.comments.rows[1][0];
  assert.equal(service.call({ action: "like", id, liked: true }).likes, 1);
  assert.equal(service.call({ action: "like", id, liked: true }).likes, 1);
  assert.equal(service.call({ action: "list" }).comments[0].liked, true);
  assert.equal(service.call({ action: "like", id, liked: true, readerHash: "b".repeat(64) }).likes, 2);
  assert.equal(service.call({ action: "like", id, liked: false }).likes, 1);
  assert.equal(service.call({ action: "like", id, liked: false }).likes, 1);
  assert.equal(service.call({ action: "list" }).comments[0].liked, false);
});

function loadTypescript(file, dependencies) {
  const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = vm.createContext({ exports: {}, require: (name) => name in dependencies ? dependencies[name] : require(name), process, fetch: (...args) => dependencies.fetch(...args), AbortSignal, URL, Buffer });
  vm.runInContext(compiled, context);
  return context.exports;
}

test("Google transport uses a server-side secret, rejects invalid config, and reports upstream failures", async () => {
  const previousUrl = process.env.GOOGLE_COMMENTS_SCRIPT_URL;
  const previousSecret = process.env.GOOGLE_COMMENTS_SECRET;
  let transportCalls = 0;
  const backend = loadTypescript("src/lib/google-sheet-comments.ts", {
    "server-only": {},
    fetch: async (_url, options) => {
      transportCalls++;
      assert.equal(options.cache, "no-store");
      assert.equal(JSON.parse(options.body).secret, process.env.GOOGLE_COMMENTS_SECRET);
      return Response.json({ ok: false, code: "RATE_LIMIT" });
    },
  });
  try {
    process.env.GOOGLE_COMMENTS_SCRIPT_URL = "https://example.com/exec";
    process.env.GOOGLE_COMMENTS_SECRET = "a".repeat(64);
    await assert.rejects(backend.callCommentsScript({ action: "list" }), (error) => error.status === 503);
    assert.equal(transportCalls, 0);
    process.env.GOOGLE_COMMENTS_SCRIPT_URL = "https://script.google.com/macros/s/test/exec";
    await assert.rejects(backend.callCommentsScript({ action: "create" }), (error) => error.status === 429);
    assert.equal(transportCalls, 1);
  } finally {
    if (previousUrl === undefined) delete process.env.GOOGLE_COMMENTS_SCRIPT_URL; else process.env.GOOGLE_COMMENTS_SCRIPT_URL = previousUrl;
    if (previousSecret === undefined) delete process.env.GOOGLE_COMMENTS_SECRET; else process.env.GOOGLE_COMMENTS_SECRET = previousSecret;
  }
});

test("API validates input and body size before sending to Google; accepted comments return pending message", async () => {
  const calls = [];
  const backend = loadTypescript("src/lib/google-sheet-comments.ts", { "server-only": {} });
  const route = loadTypescript("src/app/api/comments/route.ts", {
    "next/headers": { cookies: async () => ({ get: () => ({ value: "00000000-0000-4000-8000-000000000000" }), set: () => {} }) },
    "next/server": { NextResponse: { json: Response.json.bind(Response) } },
    "@/lib/comments": { COMMENT_NAME_LIMIT: 80, COMMENT_TEXT_LIMIT: 2000 },
    "@/lib/google-sheet-comments": { ...backend, commentsConfiguration: () => ({ secret: "a".repeat(64) }), callCommentsScript: async (payload) => { calls.push(payload); return { ok: true }; } },
  });
  const request = (body, origin = "http://localhost:3001") => new Request("http://localhost:3001/api/comments", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body) });
  const input = { action: "create", name: "", text: " Xin chào ", website: "" };
  assert.equal((await route.POST(request(input, "https://another-site.example"))).status, 403);
  assert.equal((await route.POST(request({ ...input, website: "spam" }))).status, 400);
  assert.equal((await route.POST(request({ ...input, text: "x".repeat(2001) }))).status, 400);
  assert.equal((await route.POST(request({ ...input, text: "x".repeat(17000) }))).status, 413);
  assert.equal(calls.length, 0);
  const response = await route.POST(request(input));
  assert.equal(response.status, 201);
  assert.match((await response.json()).message, /sau khi được duyệt/);
  assert.equal(calls[0].name, "Bạn đọc");
  assert.equal(calls[0].text, "Xin chào");
  assert.match(calls[0].readerHash, /^[0-9a-f]{64}$/);
  assert.equal("secret" in calls[0], false);
});
