import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnnouncementBar } from "./AnnouncementBar.tsx";

const meta = {
  title: "Components/AnnouncementBar",
  component: AnnouncementBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The release strip above the kairos.io header: ink on the page, a mono version tag in the soft accent, one sentence and a bold link.",
      },
    },
  },
  args: {
    tag: "v4.3.0",
    children: "AuroraBoot is now part of Kairos: Factory, Deploy and Fleet in one console.",
    action: <a href="#">Read the release →</a>,
  },
} satisfies Meta<typeof AnnouncementBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutTag: Story = {
  args: {
    tag: undefined,
    children: "KubeCon NA: find us at the Project Pavilion, kiosk P-15B.",
    action: <a href="#">Schedule →</a>,
  },
};
