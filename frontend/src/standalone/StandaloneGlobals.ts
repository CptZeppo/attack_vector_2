import {Id} from "../common/model/Id";

export const ice = new Id("ice")
export const app = new Id("app ")
export const layer = new Id("layer")

/**
 * Which standalone ICE surface is currently rendered. `externalHack` is true only for the
 * direct-URL/QR puzzle surface (`ExternalHackIce`), false for the in-run `siteHack` surface.
 * Kept as a module global so shared, prop-less components (e.g. CloseTabButton) can branch on it
 * without threading a prop through every game's Home component.
 */
export const standalone = { externalHack: false }