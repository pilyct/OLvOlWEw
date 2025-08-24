import type { Comment, AddCommentInput } from "../types/Comment";
import { getDb, type CommentRow } from "../db/idb";

interface CommentNode extends Comment {
  replies: CommentNode[];
}

// compare two ISO-timestamps ascending
function compareIsoAsc(a: string, b: string) {
  return a.localeCompare(b);
}

/**
 * Convert a flat list of CommentRow into a nested tree of CommentNode.
 * Parents appear before their descendants; siblings are sorted by createdAt.
 */
function buildTree(rows: CommentRow[]): CommentNode[] {
  // 1) Index: id -> node (pre-create nodes with empty replies)
  const nodeById = new Map<string, CommentNode>();
  for (const r of rows) {
    nodeById.set(r.id, {
      id: r.id,
      content: r.content,
      createdAt: r.createdAt,
      parentId: r.parentId,
      replies: [],
    });
  }

  // 2) Attach children to parents; collect roots
  const roots: CommentNode[] = [];
  for (const node of nodeById.values()) {
    const { parentId } = node;
    if (parentId && nodeById.has(parentId)) {
      nodeById.get(parentId)!.replies.push(node);
    } else {
      // treat missing/unknown parent as a root (avoids orphan loss)
      roots.push(node);
    }
  }

  // 3) Sort siblings recursively by createdAt (stable, deterministic)
  const sortDeep = (list: CommentNode[]) => {
    list.sort((a, b) => compareIsoAsc(a.createdAt, b.createdAt));
    for (const child of list) {
      if (child.replies.length) sortDeep(child.replies);
    }
  };
  sortDeep(roots);

  return roots;
}

/**
 * GET: Return all comments as a nested tree.
 */
export async function getComments(): Promise<Comment[]> {
  const db = await getDb();
  const rows = (await db.getAll("comments")) as CommentRow[];

  // pre-sort to keep deterministic ordering even before nesting.
  rows.sort((a, b) => compareIsoAsc(a.createdAt, b.createdAt));

  return buildTree(rows);
}

/**
 * POST: Add a new comment (top-level or reply).
 */
export async function addComment(input: AddCommentInput): Promise<Comment> {
  const content = (input.content ?? "").trim();
  const parentId = input.parentId ?? null;

  if (!content) {
    throw new Error("Content cannot be empty.");
  }

  const row: CommentRow = {
    id: crypto.randomUUID(),
    content,
    createdAt: new Date().toISOString(),
    parentId,
  };

  const db = await getDb();
  await db.put("comments", row);

  return { ...row, replies: [] };
}

/**
 * DELETE: Remove a comment and all of its descendants.
 * This performs a breadth-first traversal (BFS) starting at the target id.
 * Requires an index named "by_parentId" on the "comments" store.
 */
export async function deleteComment(id: string): Promise<void> {
  if (!id) {
    throw new Error("Missing comment id.");
  }

  const db = await getDb();
  const tx = db.transaction("comments", "readwrite");
  const store = tx.store;
  const byParent = store.index("by_parentId");

  // simple queue using head index to avoid O(n) Array.shift() cost.
  const queue: string[] = [id];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head++];
    const childIds = (await byParent.getAllKeys(current)) as string[];
    if (childIds?.length) queue.push(...childIds);
    await store.delete(current);
  }

  await tx.done;
}
