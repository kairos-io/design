import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeBlock, CommandSample } from "./CodeBlock.tsx";

describe("CodeBlock", () => {
  it("renders the title bar and the code as text", () => {
    render(<CodeBlock title="fleet.yaml" code={"keystore:\n  pk: /keys/PK.auth"} />);
    expect(screen.getByText("fleet.yaml")).toBeInTheDocument();
    expect(screen.getByText(/pk: \/keys\/PK.auth/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "copy" })).toBeInTheDocument();
  });

  it("never renders the code as HTML", () => {
    const { container } = render(<CodeBlock code="<img src=x onerror=alert(1)>" copyable={false} />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("copies the code without the prompt and says so", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CodeBlock prompt="$" code="kairos ui" />);
    await userEvent.click(screen.getByRole("button", { name: "copy" }));
    expect(writeText).toHaveBeenCalledWith("kairos ui");
    expect(screen.getByRole("button", { name: "copied" })).toBeInTheDocument();
  });
});

describe("CommandSample", () => {
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
