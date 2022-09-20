import { mkdir, readFile, remove } from 'fs-extra';
import Handlebars from 'handlebars';
import { resolve } from 'path';

import { HttpClient } from './HttpClient';
import { Indent } from './Indent';
import { parse as parseV3 } from './openApi/v3';
import { writeFile } from './utils/fileSystem';
import { formatCode } from './utils/formatCode';
import { formatIndentation } from './utils/formatIndentation';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { postProcessClient } from './utils/postProcessClient';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { writeClient } from './utils/writeClient';

export const generateCustom = async (inputPath?: string, outputPath?: string, templatePath?: string) => {
    if (!inputPath) throw Error('No inputPath provided');
    if (!outputPath) throw Error('No outputPath provided');
    if (!templatePath) throw Error('No templatePath provided');

    const httpClient = HttpClient.FETCH;
    const useUnionTypes = true;
    const useOptions = false;
    const exportCore = true;
    const exportServices = false;
    const exportModels = true;
    const exportSchemas = false;
    const indent = Indent.SPACE_2;
    const postfix = 'Service';

    // Generate core, models (this is mostly copied from index.ts):

    const openApi = await getOpenApiSpec(inputPath);
    const templates = registerHandlebarTemplates({
        httpClient,
        useUnionTypes,
        useOptions,
    });

    const client = parseV3(openApi);
    const clientFinal = postProcessClient(client);

    await writeClient(
        clientFinal,
        templates,
        outputPath,
        httpClient,
        useOptions,
        useUnionTypes,
        exportCore,
        exportServices,
        exportModels,
        exportSchemas,
        indent,
        postfix
    );

    // Generate services (this is custom):

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

    for (const service of clientFinal.services) {
        const file = resolve(outputPath, `services/${service.name}${postfix}.ts`);
        const templateResult = serviceTemplate({
            ...service,
            serviceBaseUrl: clientFinal.server,
            httpClient,
            useUnionTypes,
            useOptions,
            postfix,
        });
        await writeFile(file, formatIndentation(formatCode(templateResult), indent));
    }
};
