import { useCallback, useEffect, useState } from "react";
import type { Comment } from "../types/Comment";
import {
  getComments,
  addComment,
  deleteComment,
} from "../services/comment.idb.service";
import { addReplyRecursive, deleteRecursive } from "../utils/reply.helper";

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Fetch once (or on-demand via refresh) */
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComments();
      setComments(data);
    } catch (e) {
      setError((e as Error).message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Create a top-level comment */
  const add = async (content: string) => {
    const c = (content ?? "").trim();
    if (!c) throw new Error("Message content cannot be empty.");
    const created = await addComment({ content: c });
    // optimistic local append (created.replies may be undefined; normalize)
    setComments((prev) => [
      ...prev,
      { ...created, replies: created.replies ?? [] },
    ]);
  };

  /** Create a reply under a specific parent (by id) */
  const addReply = async (parentId: string, content: string) => {
    const c = (content ?? "").trim();
    if (!c) throw new Error("Message content cannot be empty.");
    const created = await addComment({ content: c, parentId });
    setComments((prev) =>
      addReplyRecursive(prev, parentId, {
        ...created,
        replies: created.replies ?? [],
      })
    );
  };

  /** Delete a comment (children cascade server-side; prune locally) */
  const remove = async (id: string) => {
    await deleteComment(id);
    setComments((prev) => deleteRecursive(prev, id));
  };

  return {
    comments,
    loading,
    error,
    setError,
    refresh, // re-fetch from server if needed
    add, // POST without parentId
    addReply, // POST with parentId
    remove, // DELETE
  };
}
