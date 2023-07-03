const npmPackage: any = {
  name: 'openapi-includer-cli',
  version: '0.0.0',
  description: 'Add `$include` keyword support to OpenAPI to include other file content that `$ref` does not support.',
  repository: {
    type: 'git',
    url: 'https://github.com/tsapporg/openapi-includer-cli'
  },
  private: false,
  license: 'MIT',
  type: 'module',
  dependencies: {
    'yaml': '2.3.1',
    'flat': 'hughsk/flat#master',
    'ts-deepmerge': '6.0.3'
  },
  devDependencies: {
    '@types/node': '18.7.17',
    'ts-node': '10.9.1',
    'tslib': '2.4.0',
    'typescript': '4.8.4',

    'openapi-typescript': '6.2.8'
  },
  scripts: {},
  bin: {
    'openapi-includer-cli': './openapi-includer-cli.sh'
  },
  files: [
    './src/',
    './openapi-includer-cli.sh',
    './tsconfig.json'
  ]
}

export default { npmPackage }