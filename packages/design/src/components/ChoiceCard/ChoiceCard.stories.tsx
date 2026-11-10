import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Tile } from "../Tiles/Tile.tsx";
import { ChoiceCard, ChoiceGroup } from "./ChoiceCard.tsx";

const meta = {
  title: "Components/ChoiceCard",
  component: ChoiceCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A selectable card, as the build wizard picks an image source, an architecture, a model or an output: a title, a line under it, a 1.5px hairline that turns to ink when selected, with the hover tint behind. In a `ChoiceGroup` the cards are radios, or checkboxes with `multiple`. `diamond` adds the accent diamond the source cards carry.",
      },
    },
  },
  args: { title: "AMD64", description: "Intel and AMD x86_64", selected: true },
} satisfies Meta<typeof ChoiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function Radios() {
  const [picked, setPicked] = useState(0);
  const sources = [
    ["Kairos base", "Start from a published base image"],
    ["Dockerfile", "Paste a Dockerfile with Kairos Factory"],
    ["Existing artifact", "Rebuild from an earlier artifact"],
  ];
  return (
    <ChoiceGroup aria-label="Image source" className="sm:grid-cols-3">
      {sources.map(([l, d], i) => (
        <ChoiceCard
          key={l}
          diamond
          title={l}
          description={d}
          selected={picked === i}
          onSelect={() => setPicked(i)}
        />
      ))}
    </ChoiceGroup>
  );
}

export const RadioGroup: Story = {
  name: "One of several, with diamonds",
  render: () => <Radios />,
};

function Checks() {
  const [out, setOut] = useState<Record<string, boolean>>({ iso: true, uki: true, netboot: false });
  const items: [string, string, string][] = [
    ["iso", "ISO", "Bootable installer image"],
    ["netboot", "Netboot", "PXE network boot artifacts"],
    ["uki", "UKI", "Signed unified kernel image"],
  ];
  return (
    <ChoiceGroup multiple aria-label="Install media" className="sm:grid-cols-3">
      {items.map(([k, l, d]) => (
        <ChoiceCard
          key={k}
          multiple
          title={l}
          description={d}
          selected={out[k]}
          onSelect={() => setOut({ ...out, [k]: !out[k] })}
          meta={<Tile size={20} tone={out[k] ? 2 : "rest"} />}
        />
      ))}
    </ChoiceGroup>
  );
}

export const CheckboxGroup: Story = {
  name: "Several, with a tile",
  render: () => <Checks />,
};
