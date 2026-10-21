import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { LevelPicker } from "./LevelPicker.tsx";

const options = [
  { value: "l1", key: "L1", label: "Guided", hint: "First touch, PoC" },
  { value: "l2", key: "L2", label: "Automate", hint: "Platform engineers" },
  { value: "l3", key: "L3", label: "Extend", hint: "Contributors, OEMs" },
];

function Harness() {
  const [v, setV] = useState("l1");
  return <LevelPicker aria-label="Docs level" value={v} onChange={setV} options={options} />;
}

describe("LevelPicker", () => {
  it("is a radio group with the chosen level checked", () => {
    render(<Harness />);
    expect(screen.getByRole("radiogroup", { name: "Docs level" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Guided/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Automate/ })).not.toBeChecked();
  });

  it("changes on click and with the arrow keys, wrapping round", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("radio", { name: /Extend/ }));
    expect(screen.getByRole("radio", { name: /Extend/ })).toBeChecked();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: /Guided/ })).toBeChecked();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: /Extend/ })).toBeChecked();
  });
});
