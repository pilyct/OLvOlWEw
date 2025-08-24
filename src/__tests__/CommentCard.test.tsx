/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentCard from "../components/CommentCard";
import type { Comment } from "../types/Comment";

// Keep icons quiet in test output
jest.mock("lucide-react", () => ({
  X: () => null,
  MessageCircle: () => null,
  ChevronDown: () => null,
  Plus: () => null,
}));

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: overrides.id ?? "c1",
    content: overrides.content ?? "Hello world",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    parentId: overrides.parentId,
    replies: overrides.replies ?? [],
  };
}

describe("CommentCard", () => {
  test("deletes, opens reply form and submits, then toggles replies", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    const onAddReply = jest.fn();

    const child = makeComment({
      id: "c2",
      parentId: "c1",
      content: "Child reply",
    });
    const root = makeComment({
      id: "c1",
      content: "Hello world",
      replies: [child],
    });

    render(
      <CommentCard comment={root} onDelete={onDelete} onAddReply={onAddReply} />
    );

    // Delete root comment
    await user.click(
      screen.getByRole("button", { name: /delete hello world/i })
    );
    expect(onDelete).toHaveBeenCalledWith("c1");

    // Open reply form on root and submit
    await user.click(
      screen.getByRole("button", { name: /reply to hello world/i })
    );
    await user.type(
      screen.getByPlaceholderText(/write your reply/i),
      "Nice post"
    );
    await user.click(screen.getByRole("button", { name: /add reply/i }));
    expect(onAddReply).toHaveBeenCalledWith("c1", "Nice post");

    // Toggle replies open (target the button by its aria-controls)
    const rootCard = screen
      .getByText("Hello world")
      .closest(".card") as HTMLElement;
    const toggle = rootCard.querySelector(
      'button[aria-controls="replies-c1"]'
    ) as HTMLButtonElement;
    expect(toggle).toBeTruthy();
    await user.click(toggle);

    // Child reply becomes visible
    expect(screen.getByText("Child reply")).toBeInTheDocument();
  });
});
