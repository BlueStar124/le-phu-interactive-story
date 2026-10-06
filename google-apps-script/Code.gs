// Dán toàn bộ file vào Apps Script mở từ chính Google Sheet của bạn.
const COMMENT_HEADERS = ["id", "name", "text", "createdAt", "status", "readerHash"];
const LIKE_HEADERS = ["commentId", "readerHash"];

function setup() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("Mở Apps Script từ menu Tiện ích mở rộng của Google Sheet.");
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty("SPREADSHEET_ID", spreadsheet.getId());
  if (!properties.getProperty("COMMENTS_SECRET")) {
    properties.setProperty("COMMENTS_SECRET", (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, ""));
  }
  const comments = initializeSheet_(spreadsheet, "Comments", COMMENT_HEADERS);
  initializeSheet_(spreadsheet, "Likes", LIKE_HEADERS);
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(["pending", "approved", "rejected"], true).setAllowInvalid(false).build();
  comments.getRange(2, 5, comments.getMaxRows() - 1, 1).setDataValidation(rule);
  comments.setColumnWidth(2, 160);
  comments.setColumnWidth(3, 480);
  comments.setColumnWidth(4, 180);
  comments.getRange("C:C").setWrap(true);
  comments.getRange("D:D").setNumberFormat("dd/MM/yyyy HH:mm:ss");
  comments.hideColumns(6);
  spreadsheet.setSpreadsheetTimeZone("Asia/Ho_Chi_Minh");
}

function initializeSheet_(spreadsheet, name, headers) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const actual = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (actual.join("|") !== headers.join("|")) throw new Error("Tab " + name + " đã có dữ liệu khác. Hãy dùng một Sheet mới.");
  }
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setBackground("#A9324E").setFontColor("#ffffff").setFontWeight("bold");
  return sheet;
}

function doGet() {
  return json_({ ok: true, message: "Comments service. Requests require authentication." });
}

function doPost(e) {
  let lock;
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > 16000) return json_({ ok: false, code: "INVALID_INPUT" });
    let body;
    try { body = JSON.parse(raw); } catch (_) { return json_({ ok: false, code: "INVALID_INPUT" }); }
    const properties = PropertiesService.getScriptProperties();
    const secret = properties.getProperty("COMMENTS_SECRET");
    if (!body || !secret || secret.length < 32 || body.secret !== secret) {
      return json_({ ok: false, code: "UNAUTHORIZED" });
    }
    if (typeof body.readerHash !== "string" || !/^[0-9a-f]{64}$/.test(body.readerHash)) {
      return json_({ ok: false, code: "INVALID_INPUT" });
    }
    if (["list", "create", "like"].indexOf(body.action) === -1) return json_({ ok: false, code: "INVALID_INPUT" });
    const spreadsheet = SpreadsheetApp.openById(properties.getProperty("SPREADSHEET_ID"));
    const comments = spreadsheet.getSheetByName("Comments");
    const likes = spreadsheet.getSheetByName("Likes");
    if (!comments || !likes) throw new Error("Run setup first");
    if (body.action === "list") return json_(list_(comments, likes, body.readerHash));
    // Serialize writes so repeated requests never insert duplicate votes.
    lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) return json_({ ok: false, code: "BUSY" });
    const result = body.action === "create" ? create_(comments, body) : like_(comments, likes, body);
    SpreadsheetApp.flush();
    return json_(result);
  } catch (_) {
    return json_({ ok: false, code: "INTERNAL_ERROR" });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function rows_(sheet, width) {
  return sheet.getLastRow() < 2 ? [] : sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues();
}

function list_(comments, likes, readerHash) {
  const approved = rows_(comments, 6).filter(function (row) {
    return row[4] === "approved" && row[0] && !isNaN(new Date(row[3]).getTime());
  });
  approved.sort(function (a, b) { return new Date(b[3]).getTime() - new Date(a[3]).getTime(); });
  const votes = rows_(likes, 2);
  return {
    ok: true,
    total: approved.length,
    comments: approved.slice(0, 100).map(function (row) {
      const matching = votes.filter(function (vote) { return vote[0] === row[0]; });
      return {
        id: String(row[0]), name: String(row[1]), text: String(row[2]),
        createdAt: new Date(row[3]).toISOString(), likes: matching.length,
        liked: matching.some(function (vote) { return vote[1] === readerHash; })
      };
    })
  };
}

function create_(comments, body) {
  if (typeof body.name !== "string" || typeof body.text !== "string") return { ok: false, code: "INVALID_INPUT" };
  const name = body.name.trim() || "Bạn đọc";
  const text = body.text.trim();
  if (!text || text.length > 2000 || name.length > 80) return { ok: false, code: "INVALID_INPUT" };
  const now = new Date();
  const recent = rows_(comments, 6).filter(function (row) {
    return row[5] === body.readerHash && now.getTime() - new Date(row[3]).getTime() < 86400000;
  });
  if (recent.length >= 10 || recent.some(function (row) { return now.getTime() - new Date(row[3]).getTime() < 60000; })) {
    return { ok: false, code: "RATE_LIMIT" };
  }
  const row = comments.getLastRow() + 1;
  ensureRow_(comments, row);
  // RichTextValue writes literal user text, including strings starting with '='.
  comments.getRange(row, 2).setRichTextValue(SpreadsheetApp.newRichTextValue().setText(name).build());
  comments.getRange(row, 3).setRichTextValue(SpreadsheetApp.newRichTextValue().setText(text).build());
  comments.getRange(row, 1).setValue(Utilities.getUuid());
  comments.getRange(row, 4).setValue(now).setNumberFormat("dd/MM/yyyy HH:mm:ss");
  comments.getRange(row, 5).setValue("pending");
  comments.getRange(row, 6).setValue(body.readerHash);
  return { ok: true };
}

function like_(comments, likes, body) {
  if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/.test(body.id) || typeof body.liked !== "boolean") {
    return { ok: false, code: "INVALID_INPUT" };
  }
  const exists = rows_(comments, 6).some(function (row) { return row[0] === body.id && row[4] === "approved"; });
  if (!exists) return { ok: false, code: "NOT_FOUND" };
  const votes = rows_(likes, 2);
  const index = votes.findIndex(function (row) { return row[0] === body.id && row[1] === body.readerHash; });
  let count = votes.filter(function (row) { return row[0] === body.id; }).length;
  if (body.liked && index === -1) {
    const row = likes.getLastRow() + 1;
    ensureRow_(likes, row);
    likes.getRange(row, 1, 1, 2).setValues([[body.id, body.readerHash]]);
    count++;
  } else if (!body.liked && index !== -1) {
    likes.deleteRow(index + 2);
    count--;
  }
  return { ok: true, id: body.id, likes: count, liked: body.liked };
}

function ensureRow_(sheet, row) {
  if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 100);
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
