import type { Client } from '../client/interfaces/Client';
import type { HttpClient } from '../HttpClient';
import type { Indent } from '../Indent';
import type { Templates } from './registerHandlebarTemplates';

import { resolve } from 'path';

import { mkdir, rmdir } from './fileSystem';
import { isDefined } from './isDefined';
import { isSubDirectory } from './isSubdirectory';
import { writeClientClass } from './writeClientClass';
import { writeClientCore } from './writeClientCore';
import { writeClientIndex } from './writeClientIndex';
import { writeClientModels } from './writeClientModels';
import { writeClientSchemas } from './writeClientSchemas';
import { writeClientServices } from './writeClientServices';
import { writeClientPathnames } from './writeClientPathnames';
import { writeClientFactories } from './writeClientFactories';
import { writeClientServers } from './writeClientServers';
import { writeClientClients } from './writeClientClients';

/**
 * Write our OpenAPI client, using the given templates at the given output
 * @param client Client object with all the models, services, etc.
 * @param templates Templates wrapper with all loaded Handlebars templates
 * @param output The relative location of the output directory
 * @param factories The relative location of the factories file
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore Generate core client classes
 * @param exportServices Generate services
 * @param exportSchemas Generate schemas
 * @param exportSchemas Generate schemas
 * @param indent Indentation options (4, 2 or tab)
 * @param postfixServices Service name postfix
 * @param postfixModels Model name postfix
 * @param clientName Custom client class name
 * @param request Path to custom request file
 */
export const writeClient = async (
    client: Client,
    templates: Templates,
    output: string,
    factories: string,
    httpClient: HttpClient,
    useUnionTypes: boolean,
    exportCore: boolean,
    exportServices: boolean,
    exportSchemas: boolean,
    indent: Indent,
    postfixServices: string,
    postfixModels: string,
    clientName?: string
): Promise<void> => {
    const outputPath = resolve(process.cwd(), output);
    const outputPathCore = resolve(outputPath, 'core');
    const outputPathPathnames = resolve(outputPath, 'pathnames');
    const outputPathServer = resolve(outputPath, 'server');
    const outputPathClient = resolve(outputPath, 'client');
    const outputPathModels = resolve(outputPath, 'models');
    const outputPathSchemas = resolve(outputPath, 'schemas');
    const outputPathServices = resolve(outputPath, 'services');
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

    if (exportCore) {
        await rmdir(outputPathCore);
        await mkdir(outputPathCore);
        await writeClientCore(client, templates, outputPathCore, httpClient, indent, clientName);
    }

    if (exportServices) {
        await rmdir(outputPathServer);
        await mkdir(outputPathServer);
        await writeClientServers(client.services, absoluteFactoriesFile, templates, outputPathServer, indent);

        await rmdir(outputPathClient);
        await mkdir(outputPathClient);
        await writeClientClients(client.services, absoluteFactoriesFile, templates, outputPathClient, indent);

        await rmdir(outputPathServices);
        await mkdir(outputPathServices);
        await writeClientServices(
            client.services,
            templates,
            outputPathServices,
            httpClient,
            useUnionTypes,
            indent,
            postfixServices,
            clientName
        );
    }

    if (exportSchemas) {
        await rmdir(outputPathSchemas);
        await mkdir(outputPathSchemas);
        await writeClientSchemas(client.models, templates, outputPathSchemas, httpClient, useUnionTypes, indent);
    }

    await rmdir(outputPathModels);
    await mkdir(outputPathModels);
    await writeClientModels(client.models, templates, outputPathModels, httpClient, useUnionTypes, indent);

    if (isDefined(clientName)) {
        await mkdir(outputPath);
        await writeClientClass(client, templates, outputPath, httpClient, clientName, indent, postfixServices);
    }

    await mkdir(outputPath);
    await writeClientIndex(
        client,
        templates,
        outputPath,
        useUnionTypes,
        exportCore,
        exportServices,
        exportSchemas,
        postfixServices,
        postfixModels,
        clientName
    );
};
