import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandSample } from "./CommandSample.tsx";

describe("CommandSample", () => {
  it("shows the command as code with a decorative prompt", () => {
    render(<CommandSample command="kairos lab up" />);
    expect(screen.getByText("kairos lab up").tagName).toBe("CODE");
  });

  it("labels the copy button with the command and copies it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CommandSample command="docker pull quay.io/kairos/hadron:v0.5.1" />);
    const button = screen.getByRole("button", { name: "Copy docker pull quay.io/kairos/hadron:v0.5.1" });
    await userEvent.click(button);
    expect(writeText).toHaveBeenCalledWith("docker pull quay.io/kairos/hadron:v0.5.1");
    expect(button).toHaveTextContent("Copied");
  });
});
