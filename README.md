# OpenAPI Typescript Codegen

[![NPM](https://badgen.net/npm/v/openapi-typescript-codegen)](https://www.npmjs.com/package/openapi-typescript-codegen)
[![License](https://badgen.net/npm/license/openapi-typescript-codegen)](https://www.npmjs.com/package/openapi-typescript-codegen)
[![Build Status](https://badgen.net/travis/ferdikoomen/openapi-typescript-codegen/master)](https://travis-ci.org/ferdikoomen/openapi-typescript-codegen)
[![Quality](https://badgen.net/lgtm/grade/javascript/g/ferdikoomen/openapi-typescript-codegen)](https://lgtm.com/projects/g/ferdikoomen/openapi-typescript-codegen)

> NodeJS library that generates Typescript clients based on the OpenAPI specification.

#### Why?
- Frontend ❤️ OpenAPI, but we do not want to use JAVA codegen in our builds.
- Quick, lightweight, robust and framework agnostic.
- Supports generation of Typescript clients.
- Supports generations of fetch and XHR http clients.
- Supports OpenAPI specification v2.0 and v3.0.
- Supports JSON and YAML files for input.


## Known issues:
- If you use enums inside your models / definitions then those enums are now
  inside a namespace with the same name as your model. This is called declaration
  merging. However Babel 7 now support compiling of Typescript and right now they
  do not support namespaces.


## Installation

```
npm install openapi-typescript-codegen --save-dev
```

## Example

**package.json**
```json
{
    "scripts": {
        "generate": "openapi ./api/openapi.json ./dist"
    }
    ...
}
```

Command line

```
npm install openapi-typescript-codegen -g

openapi ./api/openapi.json ./dist
```

NodeJS API:

```
const OpenAPI = require('openapi-typescript-codegen');

OpenAPI.generate(
    './api/openapi.json',
    './dist'
);
```
