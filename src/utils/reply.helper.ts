import type { Comment } from "../types/Comment";

/**
 * Add `reply` as a child of the node with id === `parentId`.
 * Returns a new tree only along the path that changes; otherwise
 * returns the original arrays/objects for unchanged branches.
 */
export function addReplyRecursive(
  list: Comment[],
  parentId: string,
  reply: Comment
): Comment[] {
  let mutated = false;

  const updated = list.map((node) => {
    // Found the parent: append the reply here.
    if (node.id === parentId) {
      mutated = true;
      const nextReplies = node.replies ? [...node.replies, reply] : [reply];
      return { ...node, replies: nextReplies };
    }

    // Otherwise, recurse into children (if any).
    if (!node.replies) return node;

    const childUpdated = addReplyRecursive(node.replies, parentId, reply);
    if (childUpdated === node.replies) {
      // No change in this subtree; keep original reference.
      return node;
    }

    mutated = true;
    return { ...node, replies: childUpdated };
  });

  // If nothing changed anywhere, return the original reference.
  return mutated ? updated : list;
}

/**
 * Delete the node with the given `id` and its entire subtree.
 * Like addReply, this preserves references for unchanged branches.
 */
export function deleteRecursive(list: Comment[], id: string): Comment[] {
  let mutated = false;

  // First, remove any matching node at this level.
  const hadTargetHere = list.some((n) => n.id === id);
  const base = hadTargetHere ? list.filter((n) => n.id !== id) : list;
  if (hadTargetHere) mutated = true;

  const updated = base.map((node) => {
    if (!node.replies) return node;

    const childUpdated = deleteRecursive(node.replies, id);
    if (childUpdated === node.replies) {
      // No change below; keep as-is.
      return node;
    }

    mutated = true;
    return { ...node, replies: childUpdated };
  });

  return mutated ? updated : list;
}
