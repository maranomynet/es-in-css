import { css, makeVariables, px } from '../../index.js';

const colors = {
  yellow: `yellow`,
  red: `#cc3300`,
  purple: `#990099`,
};

const bp = { large: 850 };
const mq = {
  small: `screen and (max-width: ${px(bp.large - 1)})`,
  large: `screen and (min-width: ${px(bp.large)})`,
};

const cssVars = makeVariables([
  'linkColor',
  'linkColor--hover',
  'linkColor__focus',
  'focusColor',
]);
const vars = cssVars.vars;

// ---------------------------------------------------------------------------

export default css`
  /*!@deps
    Button
  */

  :root {
    ${cssVars.declare({
      linkColor: colors.red,
      'linkColor--hover': colors.purple, // dashes must be quoted
      linkColor__focus: `var(--focusColor)`,
      focusColor: `peach`,
    })}
  }

  a[href] {
    color: ${vars.linkColor};
    unknown-property: is ok;

    &:hover {
      color: ${vars['linkColor--hover']};
    }
    &:focus-visible {
      color: ${vars.linkColor__focus};
    }
  }

  @media ${mq.large} {
    html {
      background-color: ${colors.yellow};
    }
  }
`;
