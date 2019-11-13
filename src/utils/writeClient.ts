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
import { Language } from '../index';
import * as fs from 'fs';
import { getFileName } from './getFileName';
import * as glob from 'glob';
import { cleanupServices } from './cleanupServices';

/**
 * Write our OpenAPI client, using the given templates at the given output path
 * @param client: Client object with all the models, services, etc.
 * @param language: The output language (Typescript or javascript).
 * @param templates: Templates wrapper with all loaded Handlebars templates.
 * @param outputPath
 */
export function writeClient(client: Client, language: Language, templates: Templates, outputPath: string): void {
    const outputPathCore: string = path.resolve(outputPath, 'core');
    const outputPathModels: string = path.resolve(outputPath, 'models');
    const outputPathServices: string = path.resolve(outputPath, 'services');

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
        mkdirp.sync(outputPathServices);
    } catch (e) {
        throw new Error(`Could not create output directories`);
    }

    // Copy all core files
    const coreFiles: string = path.resolve(__dirname, `../../src/templates/${language}/core/`);
    const coreFilesExt: string = getFileName('*', language);
    const coreFilesList: string[] = glob.sync(coreFilesExt, { cwd: coreFiles });
    coreFilesList.forEach(file =>
        fs.copyFileSync(
            path.resolve(coreFiles, file), // From input path
            path.resolve(outputPathCore, file) // To output path
        )
    );

    // Write the client files
    try {
        // TODO: Cleanup models
        writeClientIndex(client, language, templates.index, outputPath);
        writeClientModels(getSortedModels(client.models), language, templates.model, outputPathModels);
        writeClientServices(getSortedServices(cleanupServices(client.services)), language, templates.service, outputPathServices);
    } catch (e) {
        throw e;
    }
}
