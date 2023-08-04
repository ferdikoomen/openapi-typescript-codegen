# In code usage

## Example

```bash
  $ openapi --input ./spec.json --output ./generated --factories some/dir/factories.ts
```

some/dir/factories.ts

```typescript
import { ServerResolverFactory, ClientResolverFactory, HookFactory, HookResult } from './generated/factories';
import { createRequestParams } from './generated/util/createRequestParams';

export const createServerResolver: ServerResolverFactory = config => async (input, options) => {
    const [url, init] = createRequestParams(config, input, options);
    const response = await fetch(url, init);
    return response.json();
};

export const createClientResolver: ClientResolverFactory = config => async (input, options) => {
    const [url, init] = createRequestParams(config, input, options);
    const response = await fetch(${url}, init);
    return response.json();
};

export const createHook: HookFactory = config => (input, options) => {
    const [url, init] = createRequestParams(config, input, options);
    return [{ url, init }, { isLoading: false }] as HookResult<any>;
};
```

Some project file:

```typescript
import { Listing } from './generated/client';

const listing = await Listing.fetchOne({ slug: 'listing-slug' });
```
