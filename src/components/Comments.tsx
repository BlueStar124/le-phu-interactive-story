"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { COMMENT_NAME_LIMIT, COMMENT_TEXT_LIMIT, type ReaderComment } from "@/lib/comments";

async function commentsRequest(init?: RequestInit) {
  const response = await fetch("/api/comments", { ...init, cache: "no-store", signal: AbortSignal.timeout(30000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Không thể kết nối. Vui lòng thử lại sau.");
  return data;
}

function errorMessage(error: unknown) {
  return error instanceof Error && error.name !== "TimeoutError" && error.name !== "TypeError"
    ? error.message
    : "Kết nối bị gián đoạn. Vui lòng thử lại sau.";
}

export default function Comments() {
  const [items, setItems] = useState<ReaderComment[]>([]);
  const [total, setTotal] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyLikes, setBusyLikes] = useState<string[]>([]);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await commentsRequest();
      setItems(data.comments);
      setTotal(data.total);
      setConnected(true);
    } catch (error) {
      setLoadError(errorMessage(error));
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim() || submitting || !connected) return;
    setSubmitting(true);
    setActionError("");
    setNotice("");
    try {
      const data = await commentsRequest({
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name, text, website }),
      });
      setNotice(data.message);
      setText("");
      setName("");
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function like(comment: ReaderComment) {
    if (busyLikes.includes(comment.id)) return;
    setBusyLikes((ids) => [...ids, comment.id]);
    setActionError("");
    try {
      const data = await commentsRequest({
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", id: comment.id, liked: !comment.liked }),
      });
      setItems((current) => current.map((item) => item.id === comment.id ? { ...item, likes: data.likes, liked: data.liked } : item));
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusyLikes((ids) => ids.filter((id) => id !== comment.id));
    }
  }

  return (
    <section id="binh-luan" className="max-w-[680px] mx-auto px-4 sm:px-0 my-14">
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-5 sm:p-8">
        <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
          <MessageSquare className="w-5 h-5 text-[#A9324E]" />
          <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">Ý kiến bạn đọc</h3>
          {connected && <span className="text-xs font-semibold text-[#A9324E] bg-[#A9324E]/10 px-2 py-0.5 rounded-full ml-1">{total}</span>}
        </div>

        <form onSubmit={submit} className="mb-8 space-y-3">
          <label htmlFor="comment-text" className="sr-only">Nội dung bình luận</label>
          <textarea id="comment-text" rows={3} value={text} onChange={(event) => setText(event.target.value)}
            maxLength={COMMENT_TEXT_LIMIT} required disabled={submitting}
            placeholder="Chia sẻ cảm nhận của bạn về bài viết này..."
            className="w-full p-3.5 sm:p-4 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A9324E]/40 resize-none transition text-stone-800 placeholder:text-stone-400" />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <label htmlFor="comment-name" className="sr-only">Tên của bạn (tùy chọn)</label>
            <input id="comment-name" type="text" value={name} onChange={(event) => setName(event.target.value)}
              maxLength={COMMENT_NAME_LIMIT} disabled={submitting} autoComplete="name" placeholder="Tên của bạn (tùy chọn)"
              className="w-full sm:w-auto flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A9324E] text-stone-800" />
            <button type="submit" disabled={!text.trim() || submitting || !connected}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#A9324E] hover:bg-[#8a1f3c] disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer touch-manipulation">
              {submitting ? "Đang gửi..." : "Gửi bình luận"}
            </button>
          </div>
          <div className="hidden" aria-hidden="true">
            <label htmlFor="comment-website">Website</label>
            <input id="comment-website" name="website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
          </div>
          <p className="text-xs text-stone-500">Bình luận sẽ hiển thị sau khi được duyệt. Tối đa {COMMENT_TEXT_LIMIT.toLocaleString("vi-VN")} ký tự.</p>
          {notice && <p role="status" className="text-sm text-green-700">{notice}</p>}
          {actionError && <p role="alert" className="text-sm text-[#A9324E]">{actionError}</p>}
        </form>

        <div className="flex justify-end mb-4">
          <button type="button" onClick={() => void load()} disabled={loading || busyLikes.length > 0}
            className="text-xs text-[#A9324E] underline underline-offset-4 disabled:opacity-40 cursor-pointer">
            {loading ? "Đang tải..." : "Tải lại bình luận"}
          </button>
        </div>
        {loadError && <p role="alert" className="mb-4 text-sm text-[#A9324E]">{loadError}</p>}
        {connected && !loading && !items.length && <p className="text-sm text-stone-500">Chưa có bình luận được duyệt. Bạn có thể chia sẻ cảm nhận đầu tiên.</p>}
        {connected && total > items.length && <p className="mb-4 text-xs text-stone-500">Hiển thị {items.length} bình luận mới nhất trong {total} bình luận.</p>}
        <div className="space-y-6" aria-busy={loading}>
          {items.map((comment) => (
            <div key={comment.id} className="flex gap-3.5">
              <div className="w-9 h-9 rounded-full bg-[#FAF2DE] border border-[#e0d0b0] text-[#A9324E] font-serif font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {Array.from(comment.name)[0]?.toUpperCase() || "B"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-xs text-stone-900 break-words">{comment.name}</span>
                  <time dateTime={comment.createdAt} className="text-[10px] text-stone-400">
                    {new Date(comment.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" })}
                  </time>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap break-words">{comment.text}</p>
                <button type="button" onClick={() => void like(comment)} disabled={!connected || loading || busyLikes.includes(comment.id)}
                  aria-pressed={comment.liked} aria-label={comment.liked ? "Bỏ thích bình luận" : "Thích bình luận"}
                  className={`flex items-center gap-1.5 text-xs mt-2 transition cursor-pointer disabled:opacity-40 ${comment.liked ? "text-[#A9324E]" : "text-stone-500 hover:text-stone-800"}`}>
                  <ThumbsUp className={`w-3.5 h-3.5 ${comment.liked ? "fill-[#A9324E]" : ""}`} />
                  <span>{comment.likes > 0 ? comment.likes : "Thích"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
