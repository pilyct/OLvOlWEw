import { useState } from "react";
import { useComments } from "../hooks/useComments";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import { Plus } from "lucide-react";

function CommentSection() {
  const { comments, loading, error, refresh, add, addReply, remove } =
    useComments();
  const [open, setOpen] = useState(false);

  return (
    <section className="w-full pt-4">
      {/* Centered button; form appears BELOW when open */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="btn btn-primary inline-flex items-center gap-2"
          aria-expanded={open}
          aria-controls="comment-form"
        >
          <Plus className="w-4 h-4" />
          Create Comment
        </button>

        {open && (
          <div
            id="comment-form"
            className="w-[min(90vw,36rem)] bg-brand-white border border-gray-200 rounded-[var(--radius-lg)] shadow-sm p-4"
          >
            <CommentForm
              variant="comment"
              onSubmit={(comment) =>
                add(comment).then(() => {
                  setOpen(false);
                })
              }
              onCancel={() => setOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Error banner (only if fetch failed) */}
      {error && (
        <div
          role="alert"
          className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-red-800"
        >
          <div className="flex items-center justify-between">
            <span>Couldn’t load comments: {error}</span>
            <button className="underline" onClick={refresh}>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Initial loading skeleton (only when nothing loaded yet) */}
      {loading && comments.length === 0 ? (
        <div className="mt-4 space-y-3">
          <div className="h-16 w-full animate-pulse rounded-md bg-gray-100" />
          <div className="h-16 w-full animate-pulse rounded-md bg-gray-100" />
          <div className="h-16 w-full animate-pulse rounded-md bg-gray-100" />
        </div>
      ) : (
        <div className="mt-4">
          <CommentList
            items={comments}
            onDelete={remove}
            onAddReply={addReply}
          />
        </div>
      )}
    </section>
  );
}

export default CommentSection;
