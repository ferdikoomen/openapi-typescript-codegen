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

<table style="font-size: 12px; vertical-align: top; text-align: left;">
    <thead>
        <tr style="font-size: 12px; vertical-align: top; text-align: left;">
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
        <tr style="font-size: 12px; vertical-align: top; text-align: left;">
            <th>Supports OpenApi v2 specification</th>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr style="font-size: 12px; vertical-align: top; text-align: left;">
            <th>Supports OpenApi v3 specification</th>
            <td>✅</td>
            <td>❌</td>
            <td>❌</td>
            <td>✅</td>
            <td>✅</td>
            <td>❌</td>
            <td>❌</td>
        </tr>
        <tr style="font-size: 12px; vertical-align: top; text-align: left;">
            <th>Supports authentication</th>
            <td>✅<div>Bearer token</div></td>
            <td>❌</td>
            <td>✅<div>Bearer token</div></td>
            <td>✅<div>Bearer token</div></td>
            <td>✅<div>Bearer token</div></td>
            <td>✅<div>Bearer token</div></td>
            <td>✅<div>Bearer token</div></td>
        </tr>
        <tr style="font-size: 12px; vertical-align: top; text-align: left;">
            <th>Strongly typed models</th>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅<div>Using classes instead of simple interfaces</td>
        </tr>
        <tr style="font-size: 12px; vertical-align: top; text-align: left;">
            <th>Strongly typed enums</th>
            <td>✅</td>
            <td>✅<div>No enum is exported</div></td>
            <td>✅</td>
            <td>✅<div>Odd cast to <code>&lt;any&gt</code></div></td>
            <td>✅<div>Odd cast to <code>&lt;any&gt</code></div></td>
            <td>✅<div>Odd cast to <code>&lt;any&gt</code></div></td>
            <td>✅<div>Odd cast to <code>&lt;any&gt</code></div></td>
        </tr>
        <tr style="font-size: 12px; vertical-align: top; text-align: left;">
            <th>Models and services exported as individual files</th>
            <td>✅</td>
            <td>❌<div>All models inside one file</div></td>
            <td>✅</td>
            <td>✅</td>
            <td>❌<div>All models and services inside one file</div></td>
            <td>✅</td>
            <td>❌<div>All models and services inside one file</div></td>
        </tr>
        <tr style="font-size: 12px; vertical-align: top; text-align: left;">
            <th>Index file that exports all services and models</th>
            <td>✅</td>
            <td>✅</td>
            <td>❌</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>❌</td>
        </tr>
        <tr style="font-size: 12px; vertical-align: top; text-align: left;">
            <th>Service returns typed result</th>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>❌</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr style="font-size: 12px; vertical-align: top; text-align: left;">
            <th>Service supports sending and receiving binary content</th>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>❌<div>Passing file as <code>application/octet-stream</code></div></td>
            <td>❌<div>Passing file as <code>application/octet-stream</code></div></td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr style="font-size: 12px; vertical-align: top; text-align: left;">
            <th>Models and services contain inline documentation</th>
            <td>✅</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
        </tr>
        <tr style="font-size: 12px; vertical-align: top; text-align: left;">
            <th>Framework agnostic</th>
            <td>✅</td>
            <td>❌<div>No, using <code>aurelia</code></div></td>
            <td>❌<div>No, using <code>inversify</code> and <code>rxjs</code></div></td>
            <td>❌<div> No, using <code>angular</code></div></td>
            <td>✅<div>But depends on <code>portable-fetch</code></div></td>
            <td>❌<div>No, using <code>jquery</code></div></td>
            <td>❌<div>No, can only be used with NodeJS <code>http</code></div></td>
        </tr>
    </tbody>
</table>
