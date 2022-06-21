# Custom Saddleback OpenAPI Typescript Codegen

> For original usage read - [original README](docs/original-readme.md)

## Install

```
npm install [gitUrl] --save-dev
```

## Usage

```
$ saddlebackOpenapi --help

  Usage: saddlebackOpenapi [options]

  Options:
    -V, --version             output the version number
    -i, --input <value>       OpenAPI specification, can be a path, url or string content
    -o, --output <value>      Output directory
    -c, --config <value>      Path to the config file
    -h, --help                display help for command

  Examples
    $ saddlebackOpenapi --input ./spec.json --output ./generated
    $ saddlebackOpenapi --config ./openapi.config.json
```

## Config file
*extends original OPTIONS*
```
    input                           required in the config or cmd arguments
    output                          required in the config or cmd arguments

    additionalModelFileExtension    optional
    additionalServiceFileExtension  optional
    removeLodashPrefixes            optional
```
### Settings:
### `input`
- Default: `undefined`
- Type: `string`

OpenAPI specification, can be a path, url or string content (required in the config or cmd arguments)

### `output`
- Default: `undefined`
- Type: `string`

Output directory (required in the config or cmd arguments)

### `additionalModelFileExtension`
- Default: `true`
- Type: `boolean`

Apply `*.models.*` extension to model files.

For example (myModel.ts -> myModel.models.ts)

### `additionalServiceFileExtension`
- Default: `true`
- Type: `boolean`

Apply `*.service.*` extension to service files.

For example (myService.ts -> myService.service.ts)

### `removeLodashPrefixes`
- Default: `true`
- Type: `boolean`

Remove special prefixes that are separated by `_` at the start of names.

For example (Custom_Prefix_Name -> Name)
