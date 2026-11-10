// Shared pieces of the site pages: the theme-following logos and the data
// the decks carry, copied from their renderVals() so the pages say what the
// decks say.
import { HadronLogo, KairosLogo } from "../../components/Logo/Logo.tsx";
import { DIAMOND_POINTS, DIAMOND_VIEWBOX } from "../../lib/diamond.ts";
import { useDocumentTheme } from "../../hooks/useDocumentTheme.ts";

/** The Kairos lockup in the rendition for the current theme: colour on light, white wordmark on dark. */
export function ThemedKairosLogo({ height, label }: { height: number; label?: string }) {
  const theme = useDocumentTheme();
  return <KairosLogo variant={theme === "dark" ? "dark" : "color"} height={height} label={label} />;
}

/** The Hadron lockup in the rendition for the current theme. */
export function ThemedHadronLogo({ height, label }: { height: number; label?: string }) {
  const theme = useDocumentTheme();
  return <HadronLogo variant={theme === "dark" ? "dark" : "color"} height={height} label={label} />;
}

/** The status diamond the decks use as a bullet; `className` sets its fill (fill-accent, fill-hadron-sky). */
export function Diamond({ className, size = 12 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={DIAMOND_VIEWBOX}
      aria-hidden="true"
      className="mt-[5px] shrink-0"
    >
      <polygon points={DIAMOND_POINTS} className={className} />
    </svg>
  );
}

export const kairosHome = {
  archs: [
    { name: "x86_64", sub: "Intel / AMD" },
    { name: "ARM64", sub: "Apple Silicon, Ampere" },
  ],
  bases: ["Hadron", "Ubuntu", "Fedora", "Debian", "Alpine", "Rocky", "openSUSE"],
  stages: [
    {
      stage: "Build",
      tone: 0,
      name: "Factory",
      job: "Kairosify any image: add kairos-init to your Dockerfile and build with Docker or Podman.",
      cmd: "RUN /kairos-init",
    },
    {
      stage: "Deploy",
      tone: 1,
      name: "Installer",
      job: "Configure and install from live media in a browser.",
      cmd: "http://node:8080",
    },
    {
      stage: "Operate",
      tone: 2,
      name: "Operator",
      job: "Day-2 upgrades as Kubernetes resources.",
      cmd: "kubectl apply -f nodeop.yaml",
    },
    {
      stage: "Learn",
      tone: "ink",
      name: "Lab",
      job: "Spin up local VMs for demos and proofs of concept.",
      cmd: "kairos lab up",
    },
  ] as const,
  platformSections: [
    {
      t: "Factory",
      tone: 0,
      d: "Kairosify images, then build ISO, UKI, disk and cloud artifacts and extensions.",
    },
    { t: "Deploy", tone: 1, d: "Netboot, BMC virtual media and import to install at scale." },
    { t: "Fleet", tone: 2, d: "Register nodes, group them and roll out upgrades." },
  ] as const,
  personas: [
    {
      name: "Edge AI fleet operator",
      need: "Remote GPU devices, decade-long lifecycles, flaky networks.",
      flow: "Factory → Console · Deploy → Operator",
    },
    {
      name: "Regulated platform team",
      need: "Approved enterprise base, audit trail, GitOps everything.",
      flow: "Factory → Operator",
    },
    {
      name: "Greenfield evaluator",
      need: "Try immutable Kubernetes in an afternoon.",
      flow: "Lab → Installer → Console",
    },
    {
      name: "Factory and OEM shipper",
      need: "Pre-flash identical devices before they leave the warehouse.",
      flow: "Console · Factory → Deploy → Fleet",
    },
    {
      name: "Trusted hardware gateway",
      need: "Only signed, attested images may boot on your hardware.",
      flow: "Factory · UKI → Console · Deploy → Fleet",
    },
  ],
  levels: [
    { key: "L1", tone: "text-kairos-light", label: "Guided · GUI first" },
    { key: "L2", tone: "text-kairos-mid", label: "Automate · CLI and pipelines" },
    { key: "L3", tone: "text-kairos-orange", label: "Extend · internals and hardware" },
  ],
  inside: [
    "A/B atomic upgrades",
    "Immutable root",
    "OCI upgrades via registries",
    "Cloud-init based",
    "Dockerfile definition",
    "Recovery",
    "Reset",
    "Kubernetes · optional",
    "P2P network · optional",
  ],
  compare: [
    ["Immutable root filesystem", "Yes", "No", "Yes"],
    ["Atomic upgrades and rollback", "Yes", "No", "Yes"],
    ["Reuse existing Linux images", "Yes", "Yes", "No"],
    ["Config layering after install", "Yes", "Yes", "Varies"],
    ["Kubernetes-native OS lifecycle", "Yes", "No", "Partial"],
    ["Choice of Kubernetes distro", "Yes", "Yes", "No"],
  ],
  press: [
    {
      d: "Aug 2026",
      t: "Eleven minutes, zero humans: building a self-healing Kubernetes upgrade pipeline on Kairos",
    },
    {
      d: "May 2026",
      t: "Building a cloud-native platform from the ground up with Kairos, k0rdent and Bindy",
    },
    { d: "Dec 2025", t: "How to integrate Kairos architecturally into an edge AI platform" },
  ],
  events: [
    { d: "Oct 20", t: "What should a cloud-native OS look like?", w: "KCD UK · Edinburgh" },
    { d: "Oct 28", t: "Your GPU node is a snowflake", w: "Codemotion · Milan" },
    { d: "Nov 10", t: "Project Pavilion kiosk · P-15B", w: "KubeCon NA · Salt Lake City" },
  ],
  adopters: ["CLASTIX", "DeEEP Network", "imec", "Spectro Cloud"],
  footer: [
    { title: "Products", items: ["Console", "Factory", "Installer", "Operator", "Lab", "Hadron"] },
    { title: "Docs", items: ["Quick start", "Start here", "Reference", "Glossary"] },
    { title: "Community", items: ["Slack", "GitHub discussions", "LinkedIn", "Adopters"] },
  ].map((c) => ({
    title: c.title,
    items: c.items.map((l) => ({ label: l, href: `#${l.toLowerCase().replace(/\s+/g, "-")}` })),
  })),
};

export type DocsProduct = "Factory" | "Console" | "Installer" | "Operator" | "Lab";

export const docsProducts: Record<DocsProduct, { stage: string; repo: string; was: string; lede: string }> = {
  Factory: {
    stage: "Build",
    repo: "kairos-io/kairos-init",
    was: "kairos-init",
    lede: "Kairosify any container image: add kairos-init to your Dockerfile and build with Docker or Podman. The Factory section in the Kairos console does the same for you, then produces boot artifacts.",
  },
  Console: {
    stage: "All stages",
    repo: "kairos-io/kairos",
    was: "AuroraBoot",
    lede: "The console you run to kairosify images, deploy machines and manage your fleet. Formerly AuroraBoot, it now ships in the kairos CLI with three sections: Factory, Deploy and Fleet.",
  },
  Installer: {
    stage: "Deploy",
    repo: "kairos-io/kairos-agent",
    was: "WebUI :8080",
    lede: "Configure and install a machine from live media, in a browser on port 8080.",
  },
  Operator: {
    stage: "Operate",
    repo: "kairos-io/kairos-operator",
    was: "kairos-operator",
    lede: "Run day-2 OS operations as Kubernetes resources: upgrades, resets and node ops.",
  },
  Lab: {
    stage: "Learn",
    repo: "kairos-io/kairos-lab",
    was: "kairos-lab",
    lede: "Spin up local VMs for demos and proofs of concept.",
  },
};

export type DocsLevel = "L1" | "L2" | "L3";

export const docsLevels: {
  k: DocsLevel;
  t: string;
  who: string;
  h: string;
  body: string;
  file: string;
  code: string;
  steps: string[];
  bridgeT: string;
  bridge: string;
  cta: string;
}[] = [
  {
    k: "L1",
    t: "Guided",
    who: "First touch, PoC",
    h: "Run the console and register a node",
    body: "Start the Kairos console locally, build your first image from a template in the dashboard and watch a node register. No YAML required.",
    file: "terminal",
    code: "kairos ui\n# open http://localhost:8080",
    steps: [
      "Open the dashboard and choose “Build artifact”.",
      "Pick Hadron v0.5.1 with k3s and download the ISO.",
      "Boot a machine from it. It appears under Nodes.",
    ],
    bridgeT: "Ready to automate?",
    bridge: "Every dashboard action maps to a kairos command and an API call.",
    cta: "Go to L2",
  },
  {
    k: "L2",
    t: "Automate",
    who: "Platform engineers",
    h: "Drive Kairos from your pipeline",
    body: "Script builds and rollouts from CI. Fleet groups let you stage upgrades from canary to the whole estate.",
    file: ".github/workflows/rollout.yaml",
    code: "- run: kairos artifacts create --iso --image $IMAGE\n- run: kairos fleet rollout \\\n    --group retail-eu --image $IMAGE \\\n    --canary 5%",
    steps: [
      "Create an API token in Settings.",
      "Push a new image tag to your registry.",
      "Roll out to a canary group, then promote.",
    ],
    bridgeT: "Need trusted boot?",
    bridge: "Manage Secure Boot keys and registration hooks.",
    cta: "Go to L3",
  },
  {
    k: "L3",
    t: "Extend",
    who: "Contributors, OEMs",
    h: "Keys, hooks and internals",
    body: "The console keeps Secure Boot keys for UKI artifacts and runs hooks when nodes register, so you can attest custom hardware.",
    file: "fleet.yaml",
    code: "keystore:\n  secureboot:\n    pk: /keys/PK.auth\nhooks:\n  register: ./hooks/attest.sh",
    steps: [
      "Generate keys with kairos keys generate.",
      "Enroll them on first boot.",
      "Reject nodes that fail attestation in your hook.",
    ],
    bridgeT: "Back to basics?",
    bridge: "The guided path stays one click away.",
    cta: "Go to L1",
  },
];

export const docsSidebar: { title: string; items: string[] }[] = [
  { title: "Start here", items: ["Quick start", "Choose your path", "Glossary"] },
  { title: "Products", items: Object.keys(docsProducts) },
  { title: "Runs on", items: ["Hadron", "Kairos on Ubuntu", "Bring your own base"] },
  { title: "Reference", items: ["Configuration", "kairos CLI", "Architecture"] },
];
