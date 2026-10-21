// Vite's ?raw import of a stylesheet as a string, used by the vanilla CSS story.
declare module "*.css?raw" {
  const css: string;
  export default css;
}
