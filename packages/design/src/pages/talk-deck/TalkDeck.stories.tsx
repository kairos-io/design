import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  SlideAgenda,
  SlideClosing,
  SlideCode,
  SlideCodeKey,
  SlideDemo,
  SlideDivider,
  SlideImage,
  SlideLifecycle,
  SlideList,
  SlideNumber,
  SlideQuote,
  SlideScreenshot,
  SlideSpeaker,
  SlideStatement,
  SlideTable,
  SlideTerminal,
  SlideTitle,
} from "../../components/Slide/index.ts";

// The conference slide template from "Kairos - Talk Deck.dc.html", one story
// per layout, with the deck's own sample content. "Kairos - Presentations.dc.html"
// says how to present it and the rules: nothing under 24px at 1920×1080, light
// mode only, six to ten terminal lines, existing tokens only, names from the
// Naming page, a source for every number.

const footer = "Talk title · Event name 2026";

const meta = {
  title: "Pages/Talk deck",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'The conference slide template, from the deck `Kairos - Talk Deck.dc.html`: seventeen layouts at 1920×1080, light mode only, built from the `Slide` components. Each story is one layout with the deck\'s sample content; the frame scales to the viewport. A Hadron talk sets `brand="hadron"` on the title, divider and closing slides. The rules are in `Kairos - Presentations.dc.html`: nothing under 24px, light slides only, six to ten terminal lines, existing tokens only, names from the Naming page, a source for every number.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Title: Story = {
  render: () => (
    <SlideTitle
      event="Event name 2026 · Track"
      title="Immutable Linux for the edge, one image at a time"
      speaker="Speaker name"
      affiliation="Role, Organization · @handle"
    />
  ),
};

export const TitleHadron: Story = {
  name: "Title · Hadron",
  render: () => (
    <SlideTitle
      brand="hadron"
      event="Event name 2026 · Track"
      title="A minimal distro built for Kairos"
      speaker="Speaker name"
      affiliation="Role, Organization · @handle"
    />
  ),
};

export const Speaker: Story = {
  render: () => (
    <SlideSpeaker
      name="Speaker name"
      lines={[
        "Role at Organization",
        "Kairos maintainer since 2023",
        "Runs clusters in places with bad Wi-Fi",
      ]}
      handle="@handle · github.com/handle"
    />
  ),
};

export const Agenda: Story = {
  render: () => (
    <SlideAgenda items={["Why immutable", "Build an image", "Deploy to the fleet", "Day-2 operations"]} />
  ),
};

export const SectionDivider: Story = {
  name: "Section divider",
  render: () => <SlideDivider number="01" title="Why immutable" />,
};

export const Statement: Story = {
  render: () => (
    <SlideStatement
      statement="Every node boots the same image. Drift has nowhere to live."
      detail="Updates replace the whole OS atomically, and a failed upgrade boots back into the previous one."
      footer={footer}
    />
  ),
};

export const ContentList: Story = {
  name: "Content · list",
  render: () => (
    <SlideList
      heading="What Kairos gives you"
      items={[
        {
          title: "Bring any Linux",
          detail: "Ubuntu, Fedora, Alpine, openSUSE and more, turned into an immutable system.",
        },
        { title: "A/B upgrades", detail: "The whole OS updates as one image, with automatic rollback." },
        { title: "Kubernetes optional", detail: "Ship k3s or k0s in the image, or run without a cluster." },
      ]}
      footer={footer}
    />
  ),
};

export const Terminal: Story = {
  render: () => (
    <SlideTerminal
      heading="One CLI for the whole lifecycle"
      path="~/edge-demo"
      lines={[
        { kind: "comment", text: "start the console locally" },
        { kind: "command", text: "kairos ui" },
        { kind: "output", text: "Kairos console running at http://localhost:8080" },
        { kind: "comment", text: "or work entirely from the terminal" },
        { kind: "command", text: "kairos --help" },
        { kind: "ok", text: "  ✓ ready" },
      ]}
      footer={footer}
    />
  ),
};

export const CodeExplanation: Story = {
  name: "Code + explanation",
  render: () => (
    <SlideCode
      file="cloud-config.yaml"
      code={
        <>
          <span className="text-muted">#cloud-config</span>
          {"\n"}
          <SlideCodeKey>hostname</SlideCodeKey>: edge-01{"\n"}
          <SlideCodeKey>users</SlideCodeKey>:{"\n"}
          {"  "}- <SlideCodeKey>name</SlideCodeKey>: kairos{"\n"}
          {"    "}
          <SlideCodeKey>groups</SlideCodeKey>: [admin]{"\n"}
          <SlideCodeKey>k3s</SlideCodeKey>:{"\n"}
          {"  "}
          <SlideCodeKey>enabled</SlideCodeKey>: true
        </>
      }
      heading="Configure the node, not the image"
      points={[
        { key: "hostname", detail: "is templated per device at first boot." },
        { key: "k3s", detail: "starts the cluster that ships in the image." },
      ]}
      footer={footer}
    />
  ),
};

export const Lifecycle: Story = {
  name: "Lifecycle diagram",
  render: () => (
    <SlideLifecycle
      heading="From image to fleet"
      stages={[
        { stage: "Build", product: "Kairos Factory", detail: "Turn any Linux image into a Kairos image." },
        { stage: "Deploy", product: "Kairos Installer", detail: "Configure and install from live media." },
        { stage: "Operate", product: "Kairos Operator", detail: "Day-2 upgrades through Kubernetes CRDs." },
        { stage: "Learn", product: "Kairos Lab", detail: "Local VMs for demos and proofs of concept." },
      ]}
      footer={footer}
    />
  ),
};

export const ComparisonTable: Story = {
  name: "Comparison table",
  render: () => (
    <SlideTable
      heading="Mutable vs. immutable nodes"
      columns={["Package-managed", "Kairos"]}
      rows={[
        { label: "Updates", before: "Package by package", after: "Whole image, A/B" },
        { label: "Rollback", before: "Manual, if at all", after: "Boot the previous image" },
        { label: "Drift", before: "Accumulates over time", after: "Read-only root, none" },
      ]}
      footer={footer}
    />
  ),
};

export const BigNumber: Story = {
  name: "Big number",
  render: () => (
    <SlideNumber
      figure="1"
      caption="image for every node in the fleet"
      source="Source or context line"
      footer={footer}
    />
  ),
};

export const ImageText: Story = {
  name: "Image + text",
  render: () => (
    <SlideImage
      eyebrow="Case study"
      heading="Running in the field"
      text="Describe the environment, constraints and what changed. Two or three sentences."
      footer={footer}
    />
  ),
};

export const Screenshot: Story = {
  render: () => (
    <SlideScreenshot heading="The Kairos console" address="localhost:8080 · kairos ui" footer={footer} />
  ),
};

export const Quote: Story = {
  render: () => (
    <SlideQuote
      quote="Quote from a user about what changed once their nodes stopped drifting."
      name="Name"
      affiliation="Role, Organization"
    />
  ),
};

export const LiveDemo: Story = {
  name: "Live demo",
  render: () => <SlideDemo />,
};

export const ThankYou: Story = {
  name: "Thank you",
  render: () => (
    <SlideClosing
      links={["kairos.io", "github.com/kairos-io/kairos"]}
      handle="#kairos on CNCF Slack · @handle"
    />
  ),
};

export const ThankYouHadron: Story = {
  name: "Thank you · Hadron",
  render: () => (
    <SlideClosing
      brand="hadron"
      links={["hadron-linux.io", "github.com/kairos-io/kairos"]}
      handle="#kairos on CNCF Slack · @handle"
    />
  ),
};
