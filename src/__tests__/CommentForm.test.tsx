/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentForm from "../components/CommentForm";

jest.mock("lucide-react", () => ({
  X: () => null,
  MessageCircle: () => null,
  ChevronDown: () => null,
  Plus: () => null,
}));

describe("CommentForm", () => {
  test("submits trimmed content and supports cancel", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    render(<CommentForm onSubmit={onSubmit} onCancel={onCancel} />);

    const textarea = screen.getByPlaceholderText("Enter your comment...");
    const submit = screen.getByRole("button", { name: /add comment/i });
    const cancel = screen.getByRole("button", { name: /cancel/i });

    // Initially disabled
    expect(submit).toBeDisabled();

    await user.type(textarea, "   hello world   ");
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(onSubmit).toHaveBeenCalledWith("hello world");

    await user.click(cancel);
    expect(onCancel).toHaveBeenCalled();
  });
});
