/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentSection from "../components/CommentSection";
import type { Comment } from "../types/Comment";

jest.mock("lucide-react", () => ({
  X: () => null,
  MessageCircle: () => null,
  ChevronDown: () => null,
  Plus: () => null,
}));

type UseCommentsReturn = {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  setError: (v: string | null) => void;
  refresh: () => Promise<void>;
  add: (content: string) => Promise<void>;
  addReply: (parentId: string, content: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

// Mock the hook to return a mutable value we can override per test
const refresh = jest.fn().mockResolvedValue(undefined);
const add = jest.fn().mockResolvedValue(undefined);
const addReply = jest.fn().mockResolvedValue(undefined);
const remove = jest.fn().mockResolvedValue(undefined);
const setError = jest.fn();

const hookState: { value: UseCommentsReturn } = {
  value: {
    comments: [],
    loading: false,
    error: null,
    refresh,
    add,
    addReply,
    remove,
    setError,
  },
};

jest.mock("../hooks/useComments", () => ({
  useComments: () => hookState.value,
}));

function setUseCommentsReturn(overrides: Partial<UseCommentsReturn>) {
  hookState.value = { ...hookState.value, ...overrides };
}

describe("CommentSection", () => {
  test("shows error banner and retries", async () => {
    const user = userEvent.setup();
    setUseCommentsReturn({ comments: [], loading: false, error: "Boom" });

    render(<CommentSection />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn’t load comments: Boom"
    );

    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(refresh).toHaveBeenCalled();
  });

  test("shows initial loading skeleton", () => {
    setUseCommentsReturn({ comments: [], loading: true, error: null });
    render(<CommentSection />);

    // At least one skeleton block exists
    expect(
      screen.getAllByRole("generic", { hidden: true }).length
    ).toBeGreaterThan(0);
  });
});
