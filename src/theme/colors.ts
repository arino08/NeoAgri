export const colors = {
  primaryGreen: '#1B5E20',
  softGreen: '#C8E6C9',
  background: '#FDFDF5',
  cardBackground: '#F1F8E9',
  accent: '#A5D6A7',
  textPrimary: '#1E1E1E',
  textSecondary: '#5A5A5A',
  error: '#FFB4AB',
  warning: '#FFE082',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;
