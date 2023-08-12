# OpenAPI Typescript Codegen

[![NPM][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![Build][build-image]][build-url]

> Node.js library that generates Typescript clients based on the OpenAPI specification.

## Why?

-   Frontend ❤️ OpenAPI, but we do not want to use JAVA codegen in our builds
-   Quick, lightweight, robust and framework-agnostic 🚀
-   Supports OpenAPI specification v2.0 and v3.0
-   Supports JSON and YAML files for input
-   Supports generation through CLI, Node.js and NPX
-   Supports tsc and @babel/plugin-transform-typescript
-   Supports external references using [json-schema-ref-parser](https://github.com/APIDevTools/json-schema-ref-parser/)

## Install

```
npm install @yobta/generator --save-dev
```

## Usage

```
$ generate-yobta --help

  Usage: generate-yobta [options]

  Options:
    -V, --version             output the version number
    -i, --input <value>       OpenAPI specification, can be a path, url or string content (required)
    -o, --output <value>      Output directory (required)
    -f, --factories <value>   Path to file with factories functions (required)
    --useUnionTypes <value>   Use union types instead of enums (default: true)
    --exportSchemas <value>   Write schemas to disk (default: false)
    --indent <value>          Indentation options [4, 2, tab] (default: "4")
    --postfixModels           Model name postfix
    -h, --help                display help for command

  Examples
    $ generate-yobta --input ./spec.json --output ./generated --factories ./src/factories
```

# Documentation

-   [Basic usage](docs/basic-usage.md)
-   [Usage In Code](docs/in-code-usage.md)
-   [Enums vs. Union types](docs/enum-vs-union-types.md) `--useUnionTypes`
-   [Runtime schemas](docs/runtime-schemas.md) `--exportSchemas`
-   [Enum with custom names and descriptions](docs/custom-enums.md)
-   [Nullable props (OpenAPI v2)](docs/nullable-props.md)
-   [External references](docs/external-references.md)

# Support

-   [Babel support](docs/babel-support.md)

[npm-url]: https://npmjs.org/package/openapi-typescript-codegen
[npm-image]: https://img.shields.io/npm/v/openapi-typescript-codegen.svg
[license-url]: LICENSE
[license-image]: http://img.shields.io/npm/l/openapi-typescript-codegen.svg
[coverage-url]: https://codecov.io/gh/ferdikoomen/openapi-typescript-codegen
[coverage-image]: https://img.shields.io/codecov/c/github/ferdikoomen/openapi-typescript-codegen.svg
[downloads-url]: http://npm-stat.com/charts.html?package=openapi-typescript-codegen
[downloads-image]: http://img.shields.io/npm/dm/openapi-typescript-codegen.svg
[build-url]: https://circleci.com/gh/ferdikoomen/openapi-typescript-codegen/tree/master
[build-image]: https://circleci.com/gh/ferdikoomen/openapi-typescript-codegen/tree/master.svg?style=svg
