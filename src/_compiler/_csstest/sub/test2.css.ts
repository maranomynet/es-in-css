import { css, rgb } from '../../../index.js';

export default css`
  body {
    background-color: ${rgb('#fc0c').fade(0.5).hex()};
  }
`;
