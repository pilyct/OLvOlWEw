import { memo, useCallback, useMemo, useRef, useState, useId } from "react";
import type { Comment } from "../types/Comment";
import { X, MessageCircle, ChevronDown } from "lucide-react";
import CommentForm from "./CommentForm";
import { formatRelative } from "../utils/relative-time.helper";
import { pickRandomName } from "../utils/random-names.helper";

interface CommentCardProps {
  comment: Comment;
  onDelete: (id: string) => void;
  onAddReply: (parentId: string, content: string) => void;
}

function DeleteButton({
  onClick,
  content,
}: {
  onClick: () => void;
  content: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Delete ${content}`}
      className="btn btn-ghost px-2 py-1 text-xs"
      title="Delete"
    >
      <X className="w-4 h-4" />
    </button>
  );
}

function ReplyButton({
  onClick,
  content,
}: {
  onClick: () => void;
  content: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Reply to ${content}`}
      className="btn-reply inline-flex items-center gap-1"
      title="Reply"
    >
      <MessageCircle className="w-4 h-4" />
      Reply
    </button>
  );
}

function RepliesToggle({
  count,
  open,
  onToggle,
  repliesId,
}: {
  count: number;
  open: boolean;
  onToggle: () => void;
  repliesId: string;
}) {
  if (count <= 0) return null;

  return (
    <button
      onClick={onToggle}
      className="inline-flex items-center gap-1 text-sm px-2 rounded hover:bg-base-200 transition-colors text-[var(--color-brand)]"
      aria-expanded={open}
      aria-controls={repliesId}
      title={open ? "Hide replies" : "Show replies"}
    >
      <ChevronDown
        className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
      />
      <span className="font-medium">{count}</span>
      <span className="opacity-80 text-sm">
        {count === 1 ? "reply" : "replies"}
      </span>
    </button>
  );
}

function CardHeader({
  username,
  verb,
  absolute,
  relative,
}: {
  username: string;
  verb: string;
  absolute: string;
  relative: string;
}) {
  return (
    <small title={absolute}>
      <span className="font-bold text-[var(--color-brand-black)] text-md">
        {username}
      </span>{" "}
      {verb} {relative}
    </small>
  );
}

function ReplyFormContainer({
  onSubmit,
  onCancel,
}: {
  onSubmit: (content: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-base-100 p-4 rounded-[var(--radius-lg)] shadow-lg w-full max-w-3xl">
      <CommentForm variant="reply" onSubmit={onSubmit} onCancel={onCancel} />
    </div>
  );
}

function RepliesContainer({
  open,
  repliesId,
  children,
}: {
  open: boolean;
  repliesId: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={repliesId}
      className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
        open ? "opacity-100 max-h-[2000px]" : "opacity-0 max-h-0"
      }`}
    >
      <div className="mt-2 pl-2 border-l border-base-300 space-y-3">
        {children}
      </div>
    </div>
  );
}

function CommentCardBase({ comment, onDelete, onAddReply }: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [openReplies, setOpenReplies] = useState(false);

  // random username: compute once, no re-render trigger
  const username = useRef<string>(pickRandomName()).current;

  const isReply = Boolean(comment.parentId);
  const verb = isReply ? "replied" : "commented";

  const { absolute, relative } = useMemo(() => {
    const d = new Date(comment.createdAt);
    return { absolute: d.toLocaleString(), relative: formatRelative(d) };
  }, [comment.createdAt]);

  const replyCount = comment.replies?.length ?? 0;

  // stable id and handlers
  const auto = useId();
  const repliesId = `replies-${comment.id || auto}`;

  const handleDelete = useCallback(
    () => onDelete(comment.id),
    [onDelete, comment.id]
  );
  const openReplyForm = useCallback(() => setShowReplyForm(true), []);
  const toggleReplies = useCallback(() => setOpenReplies((v) => !v), []);
  const handleSubmitReply = useCallback(
    (content: string) => {
      onAddReply(comment.id, content);
      setShowReplyForm(false);
      setOpenReplies(true); // auto-open after posting
    },
    [onAddReply, comment.id]
  );
  const handleCancelReply = useCallback(() => setShowReplyForm(false), []);

  return (
    <div className="card relative group">
      {/* top-right controls (same position & styling) */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <DeleteButton onClick={handleDelete} content={comment.content} />
      </div>

      <div className="card-body flex flex-col items-stretch space-y-2 text-start">
        <CardHeader
          username={username}
          verb={verb}
          absolute={absolute}
          relative={relative}
        />

        <div className="card-content">{comment.content}</div>

        <div className="flex items-center gap-3">
          <ReplyButton onClick={openReplyForm} content={comment.content} />
          <RepliesToggle
            count={replyCount}
            open={openReplies}
            onToggle={toggleReplies}
            repliesId={repliesId}
          />
        </div>

        {showReplyForm && (
          <ReplyFormContainer
            onSubmit={handleSubmitReply}
            onCancel={handleCancelReply}
          />
        )}

        {replyCount > 0 && (
          <RepliesContainer open={openReplies} repliesId={repliesId}>
            {comment.replies!.map((child) => (
              <CommentCard
                key={child.id}
                comment={child}
                onDelete={onDelete}
                onAddReply={onAddReply}
              />
            ))}
          </RepliesContainer>
        )}
      </div>
    </div>
  );
}

const CommentCard = memo(CommentCardBase);
export default CommentCard;
