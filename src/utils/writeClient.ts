import { writeClientModels } from './writeClientModels';
import { writeClientServices } from './writeClientServices';
import { Client } from '../client/interfaces/Client';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import { Templates } from './readHandlebarsTemplates';
import { writeClientIndex } from './writeClientIndex';
import { getSortedModels } from './getSortedModels';
import { getSortedServices } from './getSortedServices';
import { writeClientSchemas } from './writeClientSchemas';
import { getSortedSchemas } from './getSortedSchemas';
import { Language } from '../index';

/**
 * Write our OpenAPI client, using the given templates at the given output path
 * @param client: Client object with all the models, services, etc.
 * @param language: The output language (Typescript or javascript).
 * @param templates: Templates wrapper with all loaded Handlebars templates.
 * @param outputPath
 */
export function writeClient(client: Client, language: Language, templates: Templates, outputPath: string): void {
    const outputPathCore = path.resolve(outputPath, 'core');
    const outputPathModels = path.resolve(outputPath, 'models');
    const outputPathSchemas = path.resolve(outputPath, 'schemas');
    const outputPathServices = path.resolve(outputPath, 'services');

    // Clean output directory
    try {
        rimraf.sync(outputPath);
    } catch (e) {
        throw new Error(`Could not clean output directory`);
    }

    // Create new directories
    try {
        mkdirp.sync(outputPath);
        mkdirp.sync(outputPathCore);
        mkdirp.sync(outputPathModels);
        mkdirp.sync(outputPathSchemas);
        mkdirp.sync(outputPathServices);
    } catch (e) {
        throw new Error(`Could not create output directories`);
    }

    // Write the client files
    try {
        writeClientIndex(client, language, templates.index, outputPath);
        writeClientModels(getSortedModels(client.models), language, templates.model, outputPathModels);
        writeClientSchemas(getSortedSchemas(client.schemas), language, templates.schema, outputPathSchemas);
        writeClientServices(getSortedServices(client.services), language, templates.service, outputPathServices);
    } catch (e) {
        throw e;
    }
}
