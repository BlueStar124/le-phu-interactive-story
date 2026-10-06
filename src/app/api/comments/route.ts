import { createHmac, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COMMENT_NAME_LIMIT, COMMENT_TEXT_LIMIT } from "@/lib/comments";
import { callCommentsScript, commentsConfiguration, CommentsError } from "@/lib/google-sheet-comments";

export const runtime = "nodejs";

async function readerHash() {
  const { secret } = commentsConfiguration();
  const store = await cookies();
  let id = store.get("comment_reader")?.value;
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    id = randomUUID();
    store.set("comment_reader", id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return createHmac("sha256", secret).update(id).digest("hex");
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function failure(error: unknown) {
  if (error instanceof CommentsError) return json({ error: error.message }, error.status);
  return json({ error: "Không thể xử lý bình luận. Vui lòng thử lại sau." }, 500);
}

export async function GET() {
  try {
    const data = await callCommentsScript({ action: "list", readerHash: await readerHash() });
    if (!Array.isArray(data.comments) || typeof data.total !== "number") {
      throw new CommentsError("Không thể tải danh sách bình luận. Vui lòng thử lại sau.", 502);
    }
    return json({ comments: data.comments, total: data.total });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return json({ error: "Yêu cầu không hợp lệ." }, 403);
    }
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return json({ error: "Yêu cầu không hợp lệ." }, 415);
    }
    // Bound the actual body, including requests without Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Yêu cầu không hợp lệ." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16000) {
        await reader.cancel();
        return json({ error: "Nội dung gửi quá dài." }, 413);
      }
      chunks.push(value);
    }
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
      body = parsed as Record<string, unknown>;
    } catch {
      return json({ error: "Yêu cầu không hợp lệ." }, 400);
    }
    if (body.action === "like") {
      if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/.test(body.id) || typeof body.liked !== "boolean") {
        return json({ error: "Yêu cầu không hợp lệ." }, 400);
      }
      const data = await callCommentsScript({ action: "like", id: body.id, liked: body.liked, readerHash: await readerHash() });
      return json({ id: data.id, likes: data.likes, liked: data.liked });
    }
    if (body.action !== "create" || typeof body.text !== "string" || typeof body.name !== "string" ||
        typeof body.website !== "string" || body.website !== "") {
      return json({ error: "Yêu cầu không hợp lệ." }, 400);
    }
    const text = body.text.trim();
    const name = body.name.trim() || "Bạn đọc";
    if (!text || text.length > COMMENT_TEXT_LIMIT || name.length > COMMENT_NAME_LIMIT) {
      return json({ error: `Tên tối đa ${COMMENT_NAME_LIMIT} ký tự; bình luận từ 1 đến ${COMMENT_TEXT_LIMIT} ký tự.` }, 400);
    }
    await callCommentsScript({ action: "create", text, name, readerHash: await readerHash() });
    return json({ message: "Đã nhận bình luận của bạn. Bình luận sẽ hiển thị sau khi được duyệt." }, 201);
  } catch (error) {
    return failure(error);
  }
}
