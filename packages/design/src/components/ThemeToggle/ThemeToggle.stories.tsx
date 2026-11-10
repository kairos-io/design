import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeToggle } from "./ThemeToggle.tsx";

const meta = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The system / light / dark switch, styled for the navy sidebar where both apps keep it. The full control shows all three modes; `compact` is one cycling button for the icon rail and the top bar. It writes the choice to localStorage (`kairos-theme` unless `storageKey` says otherwise) and sets `light` or `dark` on `<html>`. In Storybook the toolbar theme switch and this control both drive the page, so expect them to disagree after a click here.",
      },
    },
  },
  argTypes: {
    compact: { control: "boolean" },
    storageKey: { control: "text" },
  },
  args: { compact: false, storageKey: "kairos-theme" },
  decorators: [
    (Story) => (
      <div className="w-60 rounded-base bg-side p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: { compact: true },
  decorators: [
    (Story) => (
      <div className="inline-flex rounded-base bg-side p-3">
        <Story />
      </div>
    ),
  ],
};
