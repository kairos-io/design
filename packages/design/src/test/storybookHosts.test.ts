// @vitest-environment node
//
// The Storybook is opened from other devices: by IP, which the dev server
// always accepts, and by hostname, which it rejects with "Invalid host" unless
// .storybook/main.ts lists it. The list is read from the environment once at
// import, so each case loads the config afresh.
async function loadAllowedHosts(env: string | undefined) {
  vi.resetModules();
  if (env === undefined) vi.stubEnv("STORYBOOK_ALLOWED_HOSTS", "");
  else vi.stubEnv("STORYBOOK_ALLOWED_HOSTS", env);
  const { default: config } = await import("../../.storybook/main.ts");
  // The core preset is typed as a preset value; the config writes a plain object.
  return (config.core as { allowedHosts?: string[] | true } | undefined)?.allowedHosts;
}

describe("Storybook allowed hosts", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("allows Tailscale, mDNS and home-network names by default", async () => {
    const hosts = await loadAllowedHosts(undefined);
    expect(hosts).toEqual(expect.arrayContaining([".ts.net", ".local", ".lan", ".home.arpa", ".internal"]));
  });

  it("adds the names from STORYBOOK_ALLOWED_HOSTS, trimmed, and keeps the defaults", async () => {
    const hosts = await loadAllowedHosts(" studio.example.com, design.corp ,");
    expect(hosts).toEqual(expect.arrayContaining([".ts.net", "studio.example.com", "design.corp"]));
    expect(hosts).not.toContain("");
  });

  it("allows every host when STORYBOOK_ALLOWED_HOSTS is true", async () => {
    expect(await loadAllowedHosts("true")).toBe(true);
  });
});
