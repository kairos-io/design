import { render, screen } from "@testing-library/react";
import { DescriptionList } from "./DescriptionList.tsx";

describe("DescriptionList", () => {
  it("renders terms and values as a definition list", () => {
    render(
      <DescriptionList
        items={[
          { term: "Group", value: "retail-eu" },
          { term: "Machine ID", value: "7f3a1", mono: true },
        ]}
      />,
    );
    expect(screen.getByText("Group").tagName).toBe("DT");
    expect(screen.getByText("retail-eu").tagName).toBe("DD");
    expect(screen.getByText("7f3a1").className).toContain("font-mono");
  });
});
