# Custom Core Location

If you want to implement the core generation with a custom core
location so that it can be shared over multiple APIS.

The following example shows 2 APIS being created with a shared core.
First create a empty core

### generation.ts

```typescript
import { generate } from 'openapi-typescript-codegen';
await generate({
    input: {
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Dummy for generation core',
        },
    },
    output: `./src/generated/core`,
    httpClient: 'axios',
    exportCore: true,
    exportModels: false,
    exportSchemas: false,
    exportServices: false,
});

await generate({
    input: api1,
    output: `src/generated/api1`,
    httpClient: 'axios',
    clientName: 'api1',
    exportCore: false,
    coreLocation: `src/generated/core`,
});

await generate({
    input: api2,
    output: `src/generated/api2`,
    httpClient: 'axios',
    clientName: 'api2',
    exportCore: false,
    coreLocation: `src/generated/core`,
});
```

And this means that the following index.ts inside `src/generated/` will work with no duplicate cores generated

```typescript
export * from './core';
export * from './api1';
export * from './api2';
```
