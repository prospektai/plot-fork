/* eslint-disable @typescript-eslint/no-unused-vars */
import { Palette, PaletteOptions } from '@mui/material';

declare module '@mui/material' {
  interface Palette {
    custom_gray: Palette['custom_gray'];
    custom_black: Palette['custom_black'];
  }

  interface PaletteOptions {
    custom_gray?: PaletteOptions['custom_gray'];
    custom_black?: PaletteOptions['custom_black'];
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    custom_gray: true;
    custom_black: true;
  }
}
