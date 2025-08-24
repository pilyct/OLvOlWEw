/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import CommentList from "../components/CommentList";
import type { Comment } from "../types/Comment";

jest.mock("lucide-react", () => ({
  X: () => null,
  MessageCircle: () => null,
  ChevronDown: () => null,
  Plus: () => null,
}));

// Stub the CommentCard to keep this test focused on CommentList
jest.mock("components/CommentCard", () => ({
  __esModule: true,
  default: ({ comment }: { comment: Comment }) => (
    <div data-testid="stub-card">{comment.content}</div>
  ),
}));

describe("CommentList", () => {
  test("shows empty state", () => {
    render(
      <CommentList items={[]} onDelete={jest.fn()} onAddReply={jest.fn()} />
    );
    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
  });

  test("renders a list of comments", () => {
    const items: Comment[] = [
      {
        id: "1",
        content: "First",
        createdAt: new Date().toISOString(),
        replies: [],
      },
      {
        id: "2",
        content: "Second",
        createdAt: new Date().toISOString(),
        replies: [],
      },
    ];
    render(
      <CommentList items={items} onDelete={jest.fn()} onAddReply={jest.fn()} />
    );

    const cards = screen.getAllByTestId("stub-card");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("First");
    expect(cards[1]).toHaveTextContent("Second");
  });
});
