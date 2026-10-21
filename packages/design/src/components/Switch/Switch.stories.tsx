import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Switch } from "./Switch.tsx";

const meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "An on/off setting: the provisioning and security toggles of the build wizard. A square-cornered track, the accent when on and the raised tone when off, with the setting's name beside it and a short note in the muted ink. Use a Checkbox for a list of things to include; a Switch for one setting that takes effect on its own.",
      },
    },
  },
  args: { checked: true, label: "Trusted boot", description: "Signed UKI, TPM-sealed encryption" },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function Group() {
  const [s, setS] = useState({ trusted: true, fips: false, insecure: false });
  return (
    <div className="flex flex-col gap-3">
      <Switch
        checked={s.trusted}
        onCheckedChange={(v) => setS({ ...s, trusted: v })}
        label="Trusted boot"
        description="Signed UKI, TPM-sealed encryption"
      />
      <Switch
        checked={s.fips}
        onCheckedChange={(v) => setS({ ...s, fips: v })}
        label="FIPS"
        description="FIPS 140 crypto modules"
      />
      <Switch
        checked={s.insecure}
        onCheckedChange={(v) => setS({ ...s, insecure: v })}
        label="Allow insecure registries"
        description="Not recommended"
      />
      <Switch checked={false} disabled label="Secure erase" description="Needs a TPM" />
    </div>
  );
}

export const Security: Story = {
  name: "A group of settings",
  render: () => <Group />,
};
