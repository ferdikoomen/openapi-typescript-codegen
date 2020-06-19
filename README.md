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
  merging. However, Babel 7 now support compiling of Typescript and right now they
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

OpenAPI.generate({
    input: './api/openapi.json',
    output: './generated'
});
```

Or by providing the JSON directly:

```javascript
const OpenAPI = require('openapi-typescript-codegen');

const spec = require('./api/openapi.json');

OpenAPI.generate({
    input: spec,
    output: './generated'
});
```

## Features

### Argument-style vs. Object-style
There's no [named parameter](https://en.wikipedia.org/wiki/Named_parameter) in Javascript or Typescript, because of
that, we offer the flag `--useOptions` to generate code in two different styles.

Argument-style:
```typescript
function createUser(name: string, password: string, type?: string, address?: string) {
    // ...
}

// Usage
createUser('Jack', '123456', undefined, 'NY US');
```

Object-style:
```typescript
function createUser({ name, password, type, address }: {
    name: string,
    password: string,
    type?: string
    address?: string
}) {
    // ...
}

// Usage
createUser({
    name: 'Jack',
    password: '123456',
    address: 'NY US'
});
```


### Runtime schemas
By default the OpenAPI generator only exports interfaces for your models. These interfaces will help you during
development, but will not be available in javascript during runtime. However, Swagger allows you to define properties
that can be useful during runtime, for instance: `maxLength` of a string or a `pattern` to match, etc. Let's say
we have the following model:

```json
{
    "MyModel": {
        "required": [
            "key",
            "name"
        ],
        "type": "object",
        "properties": {
            "key": {
                "maxLength": 64,
                "pattern": "^[a-zA-Z0-9_]*$",
                "type": "string"
            },
            "name": {
                "maxLength": 255,
                "type": "string"
            },
            "enabled": {
                "type": "boolean",
                "readOnly": true
            },
            "modified": {
                "type": "string",
                "format": "date-time",
                "readOnly": true
            }
        }
    }
}
```

This will generate the following interface:

```typescript
export interface MyModel {
    key: string;
    name: string;
    readonly enabled?: boolean;
    readonly modified?: string;
}
```

The interface does not contain any properties like `maxLength` or `pattern`. However, they could be useful
if we wanted to create some form where a user could create such a model. In that form you would iterate
over the properties to render form fields based on their type and validate the input based on the `maxLength`
or `pattern` property. This requires us to have this information somewhere... For this we can use the
flag `--exportSchemas` to generate a runtime model next to the normal interface:

```typescript
export const $MyModel = {
    properties: {
        key: {
            type: 'string',
            isRequired: true,
            maxLength: 64,
            pattern: '^[a-zA-Z0-9_]*$',
        },
        name: {
            type: 'string',
            isRequired: true,
            maxLength: 255,
        },
        enabled: {
            type: 'boolean',
            isReadOnly: true,
        },
        modified: {
            type: 'string',
            isReadOnly: true,
            format: 'date-time',
        },
    },
};
```

These runtime object are prefixed with a `$` character and expose all the interesting attributes of a model
and it's properties. We can now use this object to generate the form:

```typescript jsx
import { $MyModel } from './generated';

// Some pseudo code to iterate over the properties and return a form field
// the form field could be some abstract component that renders the correct
// field type and validation rules based on the given input.
const formFields = Object.entries($MyModel.properties).map(([key, value]) => (
    <FormField
        name={key}
        type={value.type}
        format={value.format}
        maxLength={value.maxLength}
        pattern={value.pattern}
        isReadOnly={value.isReadOnly}
    />
));

const MyForm = () => (
    <form>
        {formFields}
    </form>
);

```


### Enum with custom names and descriptions
You can use `x-enum-varnames` and `x-enum-descriptions` in your spec to generate enum with custom names and descriptions.
It's not in official [spec](https://github.com/OAI/OpenAPI-Specification/issues/681) yet. But it's a supported extension
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
import { OpenAPI } from './generated';

OpenAPI.TOKEN = 'some-bearer-token';
```


### Compare to other libraries
https://htmlpreview.github.io/?https://github.com/ferdikoomen/openapi-typescript-codegen/blob/master/samples/README.html
