import CommentCard from "./CommentCard";
import type { Comment } from "../types/Comment";

interface CommentListProps {
  items: Comment[];
  onDelete: (id: string) => void;
  onAddReply: (parentId: string, content: string) => void;
}

function CommentList({ items, onDelete, onAddReply }: CommentListProps) {
  return (
    <section className="my-4 w-full">
      {items.length === 0 ? (
        <p className="text-sm opacity-50">No comments yet.</p>
      ) : (
        <ul className="mt-2 w-full max-w-3xl mx-auto space-y-2">
          {items.map((comment) => (
            <li key={comment.id} className="w-full">
              <CommentCard
                comment={comment}
                onDelete={onDelete}
                onAddReply={onAddReply}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default CommentList;
