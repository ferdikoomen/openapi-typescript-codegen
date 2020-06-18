# Compare to other libraries

Depending on which generator you use, you will see different output. For instance:
Different ways of generating models, services, level of quality, HTTP client, etc.
I've compiled a list below with the results per area and how they compare
against the openapi-typescript-codegen.

I've used the standard petshop examples from OpenAPI:
- https://petstore3.swagger.io/api/v3/openapi.json
- https://petstore.swagger.io/v2/swagger.json

And used the following generators with their default options:

- typescript-aurelia
- typescript-angular
- typescript-inversify
- typescript-angular
- typescript-fetch
- typescript-jquery
- typescript-node

#Results

<table>
    <thead>
        <tr>
            <th></th>
            <th>openapi-typscript-codegen</th>
            <th>aurelia</th>
            <th>inversify</th>
            <th>angular</th>
            <th>fetch</th>
            <th>jquery</th>
            <th>node</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>Supports OpenApi v2 specification</th>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Supports OpenApi v3 specification</th>
            <td>✅</td>
            <td>❌</td>
            <td>❌</td>
            <td>✅</td>
            <td>✅</td>
            <td>❌</td>
            <td>❌</td>
        </tr>
        <tr>
            <th>Supports authentication</th>
            <td>✅ Bearer token</td>
            <td>❌</td>
            <td>✅ Bearer token</td>
            <td>✅ Bearer token</td>
            <td>✅ Bearer token</td>
            <td>✅ Bearer token</td>
            <td>✅ Bearer token</td>
        </tr>
        <tr>
            <th>Strongly typed models</th>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅ Using classes instead of simple interfaces</td>
        </tr>
        <tr>
            <th>Strongly typed enums</th>
            <td>✅</td>
            <td>✅ No enum is exported</td>
            <td>✅</td>
            <td>✅ Odd cast to <code>&lt;any&gt</code></td>
            <td>✅ Odd cast to <code>&lt;any&gt</code></td>
            <td>✅ Odd cast to <code>&lt;any&gt</code></td>
            <td>✅ Odd cast to <code>&lt;any&gt</code></td>
        </tr>
        <tr>
            <th>Models and services exported as individual files</th>
            <td>✅</td>
            <td>❌ All models inside one file</td>
            <td>✅</td>
            <td>✅</td>
            <td>❌ All models and services inside one file</td>
            <td>✅</td>
            <td>❌ All models and services inside one file</td>
        </tr>
        <tr>
            <th>Index file that exports all services and models</th>
            <td>✅</td>
            <td>✅</td>
            <td>❌</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>❌</td>
        </tr>
        <tr>
            <th>Service returns typed result</th>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>❌</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Service supports sending and receiving binary content</th>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>❌ Passing file as application/octet-stream</td>
            <td>❌ Passing file as application/octet-stream</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Models and services contain inline documentation</th>
            <td>✅</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
        </tr>
        <tr>
            <th>Framework agnostic</th>
            <td>✅</td>
            <td>❌ No, using <code>aurelia</code></td>
            <td>❌ No, using <code>inversify</code> and <code>rxjs</code></td>
            <td>❌ No, using <code>angular</code></td>
            <td>✅ But depends on <code>portable-fetch</code></td>
            <td>❌ No, using <code>jquery</code></td>
            <td>❌ No, can only be used with NodeJS <code>http</code></td>
        </tr>
    </tbody>
</table>
