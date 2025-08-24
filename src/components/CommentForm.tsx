import { useState } from "react";

interface CommentFormProps {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  variant?: "comment" | "reply";
}

function CommentForm({
  onSubmit,
  onCancel,
  variant = "comment",
}: CommentFormProps) {
  const [content, setContent] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = content.trim();
    if (!t) return;
    onSubmit(t);
    setContent("");
  };

  const submitLabel = variant === "reply" ? "Add Reply" : "Add Comment";
  const placeholder =
    variant === "reply" ? "Write your reply..." : "Enter your comment...";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="input h-28 resize-y border border-brand"
      />
      <div className="flex gap-2 justify-end">
        <button
          type="submit"
          className="btn btn-secondary"
          disabled={!content.trim()}
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default CommentForm;
