import { mkdir, readFile, remove } from 'fs-extra';
import Handlebars from 'handlebars';
import { resolve } from 'path';

import { Client } from '../client/interfaces/Client';
import { HttpClient } from '../HttpClient';
import { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import { formatCode } from './formatCode';
import { formatIndentation } from './formatIndentation';
import { registerHandlebarTemplates } from './registerHandlebarTemplates';

export const writeClientServicesCustomTemplate = async (
    client: Client,
    outputPath: string,
    httpClient: HttpClient,
    useOptions: boolean,
    useUnionTypes: boolean,
    indent: Indent,
    postfix: string,
    templatePath: string
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

    const serviceTemplate = Handlebars.compile(await readFile(templatePath, 'utf8'));

    const servicesDir = resolve(outputPath, 'services');
    await remove(servicesDir);
    await mkdir(servicesDir);

    for (const service of client.services) {
        const file = resolve(outputPath, `services/${service.name}${postfix}.ts`);
        const templateResult = serviceTemplate({
            ...service,
            serviceBaseUrl: client.server,
            httpClient,
            useUnionTypes,
            useOptions,
            postfix,
        });
        await writeFile(file, formatIndentation(formatCode(templateResult), indent));
    }
};
