import "server-only";

export class CommentsError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export function commentsConfiguration() {
  const url = process.env.GOOGLE_COMMENTS_SCRIPT_URL?.trim();
  const secret = process.env.GOOGLE_COMMENTS_SECRET?.trim();
  if (!url || !secret || secret.length < 32) {
    throw new CommentsError("Phần bình luận chưa được kết nối. Vui lòng quay lại sau.", 503);
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new CommentsError("Phần bình luận chưa được kết nối. Vui lòng quay lại sau.", 503);
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== "script.google.com" ||
      !/^\/macros\/s\/[^/]+\/exec$/.test(parsed.pathname) || parsed.search || parsed.hash) {
    throw new CommentsError("Phần bình luận chưa được kết nối. Vui lòng quay lại sau.", 503);
  }
  return { url, secret };
}

export async function callCommentsScript(payload: Record<string, unknown>) {
  const { url, secret } = commentsConfiguration();
  let data: Record<string, unknown>;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, secret }),
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) throw new Error("Google request failed");
    const result: unknown = await response.json();
    if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error("Invalid response");
    data = result as Record<string, unknown>;
  } catch {
    throw new CommentsError("Chưa nhận được phản hồi từ hệ thống bình luận. Hãy thử tải lại sau.", 502);
  }
  if (data.ok !== true) {
    const messages: Record<string, [string, number]> = {
      RATE_LIMIT: ["Bạn gửi hơi nhanh. Vui lòng đợi 1 phút; mỗi trình duyệt được gửi tối đa 10 bình luận trong 24 giờ.", 429],
      NOT_FOUND: ["Bình luận này không còn hiển thị. Vui lòng tải lại danh sách.", 404],
      INVALID_INPUT: ["Thông tin bình luận không hợp lệ.", 400],
      BUSY: ["Hệ thống đang bận. Vui lòng thử lại sau.", 503],
    };
    const [message, status] = messages[String(data.code)] ??
      ["Không thể kết nối hệ thống bình luận. Vui lòng thử lại sau.", 502];
    throw new CommentsError(message, status);
  }
  return data;
}
