import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock, CommandSample } from "./CodeBlock.tsx";

const meta = {
  title: "Components/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A code sample with a title bar, dark in both themes, as the docs product page and the Foundations deck show it. `CommandSample` is the one-line variant on a surface with a copy chip, from the hadron-linux.io hero. For streamed logs use `Terminal`.",
      },
    },
  },
  args: {
    title: ".github/workflows/rollout.yaml",
    code: "- run: kairos artifacts create --iso --image $IMAGE\n- run: kairos fleet rollout \\\n    --group retail-eu --image $IMAGE \\\n    --canary 5%",
    copyable: true,
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPrompt: Story = {
  args: { title: "terminal", prompt: "$", code: "kairos artifacts create --iso \\\n  --image quay.io/kairos/hadron:v0.5.1" },
};

export const Command: Story = {
  render: () => <CommandSample command="docker pull quay.io/kairos/hadron:v0.5.1" />,
};
