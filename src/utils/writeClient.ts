import * as fs from 'fs';
import * as glob from 'glob';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { Client } from '../client/interfaces/Client';
import { HttpClient } from '../index';
import { Templates } from './readHandlebarsTemplates';
import { writeClientModels } from './writeClientModels';
import { writeClientSchemas } from './writeClientSchemas';
import { writeClientServices } from './writeClientServices';
import { writeClientSettings } from './writeClientSettings';

/**
 * Write our OpenAPI client, using the given templates at the given output path.
 * @param client Client object with all the models, services, etc.
 * @param httpClient The selected httpClient (fetch or XHR).
 * @param templates Templates wrapper with all loaded Handlebars templates.
 * @param outputPath
 */
export function writeClient(client: Client, httpClient: HttpClient, templates: Templates, outputPath: string): void {
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

    // Copy all support files
    const supportFiles = path.resolve(__dirname, `../../src/templates/`);
    const supportFilesList = glob.sync('**/*.ts', { cwd: supportFiles });
    supportFilesList.forEach(file => {
        fs.copyFileSync(
            path.resolve(supportFiles, file), // From input path
            path.resolve(outputPath, file) // To output path
        );
    });

    // Write the client files
    writeClientSettings(client, httpClient, templates, outputPathCore);
    writeClientModels(client.models, templates, outputPathModels);
    writeClientSchemas(client.models, templates, outputPathSchemas);
    writeClientServices(client.services, templates, outputPathServices);
}
