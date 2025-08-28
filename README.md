# Important announcement

> [!IMPORTANT] 
> Please migrate your projects to use [@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts)

Due to time limitations on my end, this project has been unmaintained for a while now. The `@hey-api/openapi-ts`
project started as a fork with the goal to resolve the most pressing issues. going forward they are planning to
maintain the OpenAPI generator and give it the love it deserves. Please support them with their work and make
sure to migrate your projects: https://heyapi.dev/openapi-ts/migrating.html#openapi-typescript-codegen

- All open PR's and issues will be archived on the 1st of May 2024
- All versions of this package will be deprecated in NPM

👋 Thanks for all the support, downloads and love! Cheers Ferdi.

---

# OpenAPI Typescript Codegen

[![NPM][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![Build][build-image]][build-url]

> Node.js library that generates Typescript clients based on the OpenAPI specification.

## Why?
- Frontend ❤️ OpenAPI, but we do not want to use JAVA codegen in our builds
- Quick, lightweight, robust and framework-agnostic 🚀
- Supports generation of TypeScript clients
- Supports generations of Fetch, Node-Fetch, Axios, Angular and XHR http clients
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
    --postfixServices         Service name postfix (default: "Service")
    --postfixModels           Model name postfix
    --request <value>         Path to custom request file
    -h, --help                display help for command

  Examples
    $ openapi --input ./spec.json --output ./generated
    $ openapi --input ./spec.json --output ./generated --client xhr
```

Documentation
===

The main documentation can be found in the [openapi-typescript-codegen/wiki](https://github.com/ferdikoomen/openapi-typescript-codegen/wiki)

Sponsors
===

If you or your company use the OpenAPI Typescript Codegen, please consider supporting me. By sponsoring I can free up time to give this project some love! Details can be found here: https://github.com/sponsors/ferdikoomen

[npm-url]: https://npmjs.org/package/openapi-typescript-codegen
[npm-image]: https://img.shields.io/npm/v/openapi-typescript-codegen.svg
[license-url]: LICENSE
[license-image]: http://img.shields.io/npm/l/openapi-typescript-codegen.svg
[coverage-url]: https://codecov.io/gh/ferdikoomen/openapi-typescript-codegen
[coverage-image]: https://img.shields.io/codecov/c/github/ferdikoomen/openapi-typescript-codegen.svg
[downloads-url]: http://npm-stat.com/charts.html?package=openapi-typescript-codegen
[downloads-image]: http://img.shields.io/npm/dm/openapi-typescript-codegen.svg
[build-url]: https://circleci.com/gh/ferdikoomen/openapi-typescript-codegen/tree/main
[build-image]: https://circleci.com/gh/ferdikoomen/openapi-typescript-codegen/tree/main.svg?style=svg
