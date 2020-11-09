
async function customClient(options) {
    const url = `${OpenAPI.BASE}${options.path}`;
    const token = typeof OpenAPI.TOKEN === 'function' ? await OpenAPI.TOKEN() : OpenAPI.TOKEN;

    const headers = options.headers || {};
    if (token != null && token !== '') {
        headers.authorization = 'Bearer ' + token;
    }
    console.log("OPTIONS", options, OpenAPI, headers)
    return {
        ok: true,
        status: 200,
        body: {
            method: options.method,
            protocol: 'http',
            hostname: 'localhost',
            path: options.path,
            url: url,
            query: options.query,
            body: options.body,
            headers: headers,
        },
        statusText: 'OK',
        url: url
    }
}

module.exports = {customClient}
