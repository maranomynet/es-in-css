import prettier from 'prettier';

export const makePrettifyCSS = (cliArg: string | true, outdir?: string) => {
  const cfgPath = typeof cliArg === 'string' ? cliArg : undefined;
  const basePath = `${(outdir || '.').replace(/\/$/, '')}/file.css`;

  const configResolver = prettier
    .resolveConfig(basePath, {
      config: cfgPath,
      editorconfig: true,
      // useCache: false,
    })
    .then((config) => Object.assign({}, config, { parser: 'css' }));

  return (css: string): Promise<string> =>
    configResolver.then((config) => prettier.format(css, config));
};
