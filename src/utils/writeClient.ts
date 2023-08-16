import type { Client } from '../client/interfaces/Client';
import type { Indent } from '../Indent';
import type { Templates } from './registerHandlebarTemplates.js';

import { resolve } from 'path';

import { mkdir, rmdir } from './fileSystem.js';
import { isSubDirectory } from './isSubdirectory.js';
import { writeClientIndex } from './writeClientIndex.js';
import { writeClientModels } from './writeClientModels.js';
import { writeClientSchemas } from './writeClientSchemas.js';
import { writeClientPathnames } from './writeClientPathnames.js';
import { writeClientFactories } from './writeClientFactories.js';
import { writeClientServers } from './writeClientServers.js';
import { writeClientClients } from './writeClientClients.js';
import { writeClientHooks } from './writeClientHooks.js';

/**
 * Write our OpenAPI client, using the given templates at the given output
 * @param client Client object with all the models, services, etc.
 * @param templates Templates wrapper with all loaded Handlebars templates
 * @param output The relative location of the output directory
 * @param factories The relative location of the factories file
 * @param useUnionTypes Use union types instead of enums
 * @param exportServices Generate services
 * @param exportSchemas Generate schemas
 * @param indent Indentation options (4, 2 or tab)
 * @param postfixModels Model name postfix
 * @param request Path to custom request file
 */
export const writeClient = async (
    client: Client,
    templates: Templates,
    output: string,
    factories: string,
    useUnionTypes: boolean,
    exportServices: boolean,
    exportSchemas: boolean,
    indent: Indent,
    postfixModels: string
): Promise<void> => {
    const outputPath = resolve(process.cwd(), output);
    const outputPathPathnames = resolve(outputPath, 'pathnames');
    const outputPathServer = resolve(outputPath, 'server');
    const outputPathClient = resolve(outputPath, 'client');
    const outputPathHook = resolve(outputPath, 'hook');
    const outputPathModels = resolve(outputPath, 'models');
    const outputPathSchemas = resolve(outputPath, 'schemas');
    const outputPathFactories = resolve(outputPath, 'factories');
    const absoluteFactoriesFile = resolve(process.cwd(), factories);

    if (!isSubDirectory(process.cwd(), output)) {
        throw new Error(`Output folder is not a subdirectory of the current working directory`);
    }

    await rmdir(outputPathFactories);
    await mkdir(outputPathFactories);
    await writeClientFactories(client.services, templates, outputPathFactories, indent);

    await rmdir(outputPathPathnames);
    await mkdir(outputPathPathnames);
    await writeClientPathnames(client.services, templates, outputPathPathnames, indent);

    if (exportServices) {
        await rmdir(outputPathServer);
        await mkdir(outputPathServer);
        await writeClientServers(client.services, absoluteFactoriesFile, templates, outputPathServer, indent);

        await rmdir(outputPathClient);
        await mkdir(outputPathClient);
        await writeClientClients(client.services, absoluteFactoriesFile, templates, outputPathClient, indent);

        await rmdir(outputPathHook);
        await mkdir(outputPathHook);
        await writeClientHooks(client.services, absoluteFactoriesFile, templates, outputPathHook, indent);
    }

    if (exportSchemas) {
        await rmdir(outputPathSchemas);
        await mkdir(outputPathSchemas);
        await writeClientSchemas(client.models, templates, outputPathSchemas, useUnionTypes, indent);
    }

    await rmdir(outputPathModels);
    await mkdir(outputPathModels);
    await writeClientModels(client.models, templates, outputPathModels, useUnionTypes, indent);

    await mkdir(outputPath);
    await writeClientIndex(client, templates, outputPath, useUnionTypes, exportServices, exportSchemas, postfixModels);
};
