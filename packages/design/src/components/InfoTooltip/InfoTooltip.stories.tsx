import type { Meta, StoryObj } from "@storybook/react-vite";
import { InfoTooltip } from "./InfoTooltip.tsx";

const meta = {
  title: "Components/InfoTooltip",
  component: InfoTooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "An info button next to a form label that explains a field in a sentence or two, with a link to the docs when there is one. Hover or click opens it; it stays open while the pointer is inside so the link can be clicked, and Escape closes it. Give it a `label` that names the field. For anything longer, put the text under the field as help text.",
      },
    },
  },
  args: {
    label: "About the base image",
    children: (
      <>
        A container image with a Kairos framework, for example <code>quay.io/kairos/hadron:v0.5.1</code>.{" "}
        <a href="https://kairos.io/docs" target="_blank" rel="noreferrer">
          Image reference docs
        </a>
      </>
    ),
  },
} satisfies Meta<typeof InfoTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="pt-24">
      <label className="flex items-center text-sm font-semibold">
        Base image
        <InfoTooltip {...args} />
      </label>
    </div>
  ),
};

export const Open: Story = {
  name: "Open panel",
  args: { defaultOpen: true },
  render: (args) => (
    <div className="pt-24">
      <label className="flex items-center text-sm font-semibold">
        Base image
        <InfoTooltip {...args} />
      </label>
    </div>
  ),
};
