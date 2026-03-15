export const colors = {
  void: '#0d0b08', ash: '#13100d', ember: '#1e1710', iron: '#2a241c',
  stone: '#3d3428', bone: '#7a6a52', parchment: '#c4a96e',
  gold: '#d4941a', goldBright: '#f0b429',
  blood: '#8b1a1a', bloodBright: '#c0392b',
  ice: '#7ab3cc', iceBright: '#a8d4e8',
} as const
export type ColorToken = keyof typeof colors
