# OpenAPI Typescript Codegen

[![NPM][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Coverage][coverage-image]][coverage-url]
[![Quality][quality-image]][quality-url]
[![Code Climate][climate-image]][climate-url]
[![Downloads][downloads-image]][downloads-url]
[![Build][build-image]][build-url]

> Node.js library that generates Typescript clients based on the OpenAPI specification.

## Why?
- Frontend ❤️ OpenAPI, but we do not want to use JAVA codegen in our builds
- Quick, lightweight, robust and framework-agnostic 🚀
- Supports generation of TypeScript clients
- Supports generations of Fetch, [Node-Fetch](#node-fetch-support), [Axios](#axios-support), [Angular](#angular-support) and XHR http clients
- Supports OpenAPI specification v2.0 and v3.0
- Supports JSON and YAML files for input
- Supports generation through CLI, Node.js and NPX
- Supports tsc and @babel/plugin-transform-typescript
- Supports aborting of requests (cancelable promise pattern)
- Supports external references using [json-schema-ref-parser](https://github.com/APIDevTools/json-schema-ref-parser/)

## Install

```
npm install openapi-typescript-codegen --save-dev
```

## Usage

```
$ openapi --help

  Usage: openapi [options]

  Options:
    -V, --version             output the version number
    -i, --input <value>       OpenAPI specification, can be a path, url or string content (required)
    -o, --output <value>      Output directory (required)
    -c, --client <value>      HTTP client to generate [fetch, xhr, node, axios, angular] (default: "fetch")
    --name <value>            Custom client class name
    --useOptions              Use options instead of arguments
    --useUnionTypes           Use union types instead of enums
    --exportCore <value>      Write core files to disk (default: true)
    --exportServices <value>  Write services to disk (default: true)
    --exportModels <value>    Write models to disk (default: true)
    --exportSchemas <value>   Write schemas to disk (default: false)
    --indent <value>          Indentation options [4, 2, tab] (default: "4")
    --postfix <value>         Service name postfix (default: "Service")
    --request <value>         Path to custom request file
    -h, --help                display help for command

  Examples
    $ openapi --input ./spec.json --output ./generated
    $ openapi --input ./spec.json --output ./generated --client xhr
```

Documentation
===
- [Basic usage](basic-usage.md)
- [OpenAPI object](openapi-object.md)
- [Client instances](client-instances.md) `--name`
- [Argument vs. Object style](arguments-vs-object-style.md) `--useOptions`
- [Enums vs. Union types](enum-vs-union-types.md) `--useUnionTypes`
- [Runtime schemas](runtime-schemas.md) `--exportSchemas`
- [Enum with custom names and descriptions](custom-enums.md)
- [Nullable props (OpenAPI v2)](nullable-props.md)
- [Authorization](authorization.md)
- [External references](external-references.md)
- [Canceling requests](canceling-requests.md)
- [Custom request file](custom-request-file.md)

Support
===
- [Babel support](babel-support.md)
- [Axios support](axios-support.md)
- [Angular support](angular-support.md)
- [Node-Fetch support](node-fetch-support.md)

[npm-url]: https://npmjs.org/package/openapi-typescript-codegen
[npm-image]: https://img.shields.io/npm/v/openapi-typescript-codegen.svg
[license-url]: ../LICENSE
[license-image]: http://img.shields.io/npm/l/openapi-typescript-codegen.svg
[coverage-url]: https://codecov.io/gh/ferdikoomen/openapi-typescript-codegen
[coverage-image]: https://img.shields.io/codecov/c/github/ferdikoomen/openapi-typescript-codegen.svg
[quality-url]: https://lgtm.com/projects/g/ferdikoomen/openapi-typescript-codegen
[quality-image]: https://img.shields.io/lgtm/grade/javascript/g/ferdikoomen/openapi-typescript-codegen.svg
[climate-url]: https://codeclimate.com/github/ferdikoomen/openapi-typescript-codegen
[climate-image]: https://img.shields.io/codeclimate/maintainability/ferdikoomen/openapi-typescript-codegen.svg
[downloads-url]: http://npm-stat.com/charts.html?package=openapi-typescript-codegen
[downloads-image]: http://img.shields.io/npm/dm/openapi-typescript-codegen.svg
[build-url]: https://circleci.com/gh/ferdikoomen/openapi-typescript-codegen/tree/master
[build-image]: https://circleci.com/gh/ferdikoomen/openapi-typescript-codegen/tree/master.svg?style=svg
