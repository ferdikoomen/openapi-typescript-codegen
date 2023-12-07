import { readFile, remove } from 'fs-extra';
import Handlebars from 'handlebars';
import { resolve } from 'path';

import { Client } from '../../client/interfaces/Client';
import { HttpClient } from '../../HttpClient';
import { Indent } from '../../Indent';
import { writeFile } from '../fileSystem';
import { formatCode as f } from '../formatCode';
import { formatIndentation as i } from '../formatIndentation';
import { isDefined } from '../isDefined.js';
import { registerHandlebarTemplates } from '../registerHandlebarTemplates';
import { sortModelsByName } from '../sortModelsByName.js';
import { sortServicesByName } from '../sortServicesByName.js';

export const writeClientIndexCustomTemplate = async (
    client: Client,
    outputPath: string,
    httpClient: HttpClient,
    useOptions: boolean,
    useUnionTypes: boolean,
    indent: Indent,
    postfixServices: string,
    postfixModels: string,
    templatePath: string,
    exportCore: boolean,
    exportServices: boolean,
    exportModels: boolean,
    exportSchemas: boolean,
    exportClient: boolean,
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

    const indexTemplate = Handlebars.compile(await readFile(templatePath, 'utf8'));

    const dir = resolve(outputPath, 'index.ts');
    await remove(dir);

    const templateResult = indexTemplate({
        serviceBaseUrl: client.server,
        exportCore,
        exportServices,
        exportModels,
        exportSchemas,
        useUnionTypes,
        postfixServices,
        postfixModels,
        clientName,
        server: client.server,
        version: client.version,
        models: sortModelsByName(client.models),
        services: sortServicesByName(client.services),
        exportClient: isDefined(clientName) && exportClient,
    });
    await writeFile(resolve(outputPath, 'index.ts'), i(f(templateResult), indent));
};
