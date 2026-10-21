// The Kairos tiles, one file per component. This module keeps the single
// import path the stories, tests and index use.
export type { TileBias, TileFade, TilePalette, TileTone } from "../../lib/tiles.ts";
export type { PaletteProp } from "./shared.ts";
export { TileField, type TileFieldProps } from "./TileField.tsx";
export { TileUnit, type TileUnitProps } from "./TileUnit.tsx";
export { Tile, TileBar, type TileBarProps, type TileProps } from "./Tile.tsx";
export { TileMarker, type TileMarkerProps } from "./TileMarker.tsx";
