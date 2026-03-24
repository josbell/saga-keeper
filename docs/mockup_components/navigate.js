/**
 * Shared hash-based navigation utility.
 * Matches the router in src/App.jsx — routes live at #/<path>.
 * Calling navigate("") returns to the home nav screen.
 */
export const PATHS = {
  home:         "",
  ironSheet:    "iron-sheet",
  greatHall:    "great-hall",
  theOracle:    "the-oracle",
  theSkald:     "the-skald",
  skaldDuo:     "skald-duo",
  skaldOracle:  "skald-oracle",
  theForge:     "the-forge",
  worldForge:   "world-forge",
};

export function navigate(path) {
  window.location.hash = path ? `/${path}` : "";
}
