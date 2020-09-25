In the before all script:

generate 6 libraries
- fetch (v2 & v3)
- xhr (v2 & v3)
- node (v2 & v3)

/generated/v2/fetch
/generated/v2/xhr
/generated/v2/node
/generated/v3/fetch
/generated/v3/xhr
/generated/v3/node

link in 6 projects
- fetch (v2 & v3)
- xhr (v2 & v3)
- node (v2 & v3)
Note: This can be one base 'template' that copies to dirs above

Compile projects

Start server that serves the api echo sever.

In the tests:
Run e2e tests (node + puppeteer)

After all tests:
Close pupeteer and server!


