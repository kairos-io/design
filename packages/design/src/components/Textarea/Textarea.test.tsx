import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./Textarea.tsx";

describe("Textarea", () => {
  it("accepts multi-line typing", async () => {
    render(<Textarea aria-label="Cloud config" />);
    const area = screen.getByRole("textbox", { name: "Cloud config" });
    await userEvent.type(area, "#cloud-config{enter}hostname: edge-01");
    expect(area).toHaveValue("#cloud-config\nhostname: edge-01");
  });

  it("is disabled when asked", () => {
    render(<Textarea aria-label="Cloud config" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
