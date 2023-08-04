# Basic usage

```
$ openapi --help

  Usage: openapi [options]

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
    $ openapi --input ./spec.json --output ./generated --factories some/dir/factories-file.ts
```

## Example

**package.json**

```json
{
    "scripts": {
        "generate": "openapi --input ./spec.json --output ./generated --factories some/dir/factories-file.ts"
    }
}
```

**NPX**

```
npx @yobta/generator --input ./spec.json --output ./generated --factories some/dir/factories-file.ts
```

**Node.js**

```javascript
const OpenAPI = require('openapi-typescript-codegen');

OpenAPI.generate({
    input: './spec.json',
    output: './generated',
    factories: './factories.ts',
});

// Or by providing the content of the spec directly 🚀
OpenAPI.generate({
    input: require('./spec.json'),
    output: './generated',
    factories: './factories.ts',
});
```
