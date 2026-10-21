import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommandSample } from "./CommandSample.tsx";

const meta = {
  title: "Components/CommandSample",
  component: CommandSample,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "One command on a surface with a copy chip, from the hadron-linux.io hero. The prompt is decoration; only the command is copied. For a multi-line sample or a log, use `Terminal`.",
      },
    },
  },
  args: { command: "docker pull quay.io/kairos/hadron:v0.5.1", copyLabel: "Copy" },
} satisfies Meta<typeof CommandSample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
