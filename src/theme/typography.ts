import { Platform } from 'react-native';

export const typography = {
  primary: Platform.select({ ios: 'System', android: 'Roboto' }) as string,
  secondary: Platform.select({ ios: 'System', android: 'Roboto' }) as string,
  message: Platform.select({ ios: 'System', android: 'Roboto' }) as string,

  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 26,
    xxl: 36,
  },

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
};
