import { readFile, remove } from 'fs-extra';
import Handlebars from 'handlebars';
import { resolve } from 'path';

import { Client } from '../../client/interfaces/Client';
import { HttpClient } from '../../HttpClient';
import { Indent } from '../../Indent';
import { writeFile } from '../fileSystem';
import { formatCode as f } from '../formatCode';
import { formatIndentation as i } from '../formatIndentation';
import { getHttpRequestName } from '../getHttpRequestName.js';
import { registerHandlebarTemplates } from '../registerHandlebarTemplates';
import { sortModelsByName } from '../sortModelsByName.js';
import { sortServicesByName } from '../sortServicesByName.js';

export const writeClientClassCustomTemplate = async (
    client: Client,
    outputPath: string,
    httpClient: HttpClient,
    useOptions: boolean,
    useUnionTypes: boolean,
    indent: Indent,
    postfix: string,
    templatePath: string,
    clientName?: string
) => {
    registerHandlebarTemplates({
        httpClient,
        useUnionTypes,
        useOptions,
        handlebars: Handlebars, // since we're not using precompiled templates, we need a different object here
    });
    Handlebars.registerHelper('capitalize', str => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    });

    const clientClassTemplate = Handlebars.compile(await readFile(templatePath, 'utf8'));

    const clientClassFile = resolve(outputPath, `${clientName}.ts`);
    await remove(clientClassFile);

    const templateResult = clientClassTemplate({
        clientName,
        httpClient,
        postfix,
        server: client.server,
        version: client.version,
        models: sortModelsByName(client.models),
        services: sortServicesByName(client.services),
        httpRequest: getHttpRequestName(httpClient),
    });

    await writeFile(resolve(outputPath, `${clientName}.ts`), i(f(templateResult), indent));
};
