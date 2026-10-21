import { render, screen } from "@testing-library/react";
import { Input } from "../Input/Input.tsx";
import { Label } from "./Label.tsx";

describe("Label", () => {
  it("labels the control it points at", () => {
    render(
      <>
        <Label htmlFor="device">Install device</Label>
        <Input id="device" />
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Install device" })).toBeInTheDocument();
  });
});
