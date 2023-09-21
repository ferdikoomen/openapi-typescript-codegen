# Authorization

The OpenAPI generator supports Bearer Token authorization. In order to enable the sending
of tokens in each request you can set the token using the global OpenAPI configuration:

```typescript
import { OpenAPI } from './generated';

OpenAPI.TOKEN = 'some-bearer-token';
```

Alternatively, we also support an async method that provides the token for each request.
You can simply assign this method to the same `TOKEN `property in the global OpenAPI object.

```typescript
import { OpenAPI } from './generated';

const getToken = async () => {
    // Some code that requests a token...
    return 'SOME_TOKEN';
};

OpenAPI.TOKEN = getToken;
```

Also, you can pass `TOKEN` or any OpenAPI configuration params to method call.
```typescript
const organizations = new OrganizationsService();
OpenAPI.BASE = 'https://example.com/api';

express.use(async (req, res) => {
    const response = await organizations.createOrganization(
        {
            name: 'OrgName',
            description: 'OrgDescription',
        },
        {
            TOKEN: getToken(req)
        }
    );
    res.send(response);
})
```
