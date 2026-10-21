import { render, screen } from "@testing-library/react";
import { AnnouncementBar } from "./AnnouncementBar.tsx";

describe("AnnouncementBar", () => {
  it("is a labelled region with the tag, the sentence and the action", () => {
    render(
      <AnnouncementBar tag="v4.3.0" action={<a href="#release">Read the release →</a>}>
        AuroraBoot is now part of Kairos.
      </AnnouncementBar>,
    );
    expect(screen.getByRole("region", { name: "Announcement" })).toBeInTheDocument();
    expect(screen.getByText("v4.3.0")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read the release →" })).toHaveAttribute("href", "#release");
  });
});
