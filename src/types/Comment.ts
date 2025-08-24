export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  replies?: Comment[];
}

export interface AddCommentInput {
  content: string;
  parentId?: string | null;
}
