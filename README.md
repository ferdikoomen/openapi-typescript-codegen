# OpenAPI Typescript Codegen

[![NPM](https://badgen.net/npm/v/openapi-typescript-codegen)](https://www.npmjs.com/package/openapi-typescript-codegen)
[![License](https://badgen.net/npm/license/openapi-typescript-codegen)](https://www.npmjs.com/package/openapi-typescript-codegen)
[![Build Status](https://badgen.net/travis/ferdikoomen/openapi-typescript-codegen/master)](https://travis-ci.org/ferdikoomen/openapi-typescript-codegen)
[![Codecov](https://codecov.io/gh/ferdikoomen/openapi-typescript-codegen/branch/master/graph/badge.svg)](https://codecov.io/gh/ferdikoomen/openapi-typescript-codegen)
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
        "generate": "openapi --input ./api/openapi.json --output ./dist"
    }
}
```

**Command line**

```
npm install openapi-typescript-codegen -g

openapi --input ./api/openapi.json --output ./dist
```

**NodeJS API**

```javascript
const OpenAPI = require('openapi-typescript-codegen');

OpenAPI.generate(
    './api/openapi.json',
    './dist'
);
```

## Features

### Argument-style vs. Object-style
There's no [named parameter](https://en.wikipedia.org/wiki/Named_parameter) in JS/TS, because of that,
we offer an option `--useOptions` to generate code in two different styles.

Argument-style:
```typescript
function createUser(name: string, password: string, type?: string, address?: string) {
    // ...
}

// usage
createUser('Jack', '123456', undefined, 'NY US');
```

Object-style:
```typescript
interface CreateUserOptions {
    name: string,
    password: string,
    type?: string
    address?: string
}

function createUser({ name, password, type, address }: CreateUserOptions) {
    // ...
}

// usage
createUser({
    name: 'Jack',
    password: '123456',
    address: 'NY US'
});
```

### Enum with custom names and descriptions
You can use `x-enum-varnames` and `x-enum-descriptions` in your spec to generate enum with custom names and descriptions.
It's not in official [spec](https://github.com/OAI/OpenAPI-Specification/issues/681) yet. But its a supported extension
that can help developers use more meaningful enumerators.
```json
{
    "EnumWithStrings": {
        "description": "This is a simple enum with strings",
        "enum": [
            0,
            1,
            2
        ],
        "x-enum-varnames": [
            "Success",
            "Warning"
            "Error"
        ],
        "x-enum-descriptions": [
            "Used when the status of something is successful",
            "Used when the status of something has a warning"
            "Used when the status of something has an error"
        ]
    }
}
```

Generated code:
```typescript
enum EnumWithStrings {
    /*
    * Used when the status of something is successful
    */
    Success = 0,
    /*
    * Used when the status of something has a warning
    */
    Waring = 1,
    /*
    * Used when the status of something has an error
    */
    Error = 2,
}
```

### Authorization
The OpenAPI generator supports Bearer Token authorization. In order to enable the sending
of tokens in each request you can set the token using the global OpenAPI configuration:

```typescript
import { OpenAPI } from './'
OpenAPI.TOKEN = 'some-bearer-token'
```
