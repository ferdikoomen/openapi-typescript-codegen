import * as path from 'path';
import { parse as parseV2 } from './openApi/v2';
import { parse as parseV3 } from './openApi/v3';
import { readHandlebarsTemplates, Templates } from './utils/readHandlebarsTemplates';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { writeClient } from './utils/writeClient';
import * as os from 'os';
import * as chalk from 'chalk';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { Client } from './client/interfaces/Client';

export enum Language {
    TYPESCRIPT = 'typescript',
    JAVASCRIPT = 'javascript',
}

export enum HttpClient {
    FETCH = 'fetch',
    XHR = 'xhr',
}

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param input The relative location of the OpenAPI spec.
 * @param output The relative location of the output directory
 * @param language: The language that should be generated (Typescript or Javascript)
 * @param httpClient: The selected httpClient (fetch or XHR)
 */
export function generate(input: string, output: string, language: Language = Language.TYPESCRIPT, httpClient: HttpClient = HttpClient.FETCH): void {
    const inputPath = path.resolve(process.cwd(), input);
    const outputPath = path.resolve(process.cwd(), output);

    console.log(chalk.bold.green('Generate:'));
    console.log(chalk.grey('  Input:'), input);
    console.log(chalk.grey('  Output:'), output);
    console.log(chalk.grey('  Language:'), language);
    console.log(chalk.grey('  HTTP client:'), httpClient);
    console.log(os.EOL);

    try {
        // Load the specification, read the OpenAPI version and load the
        // handlebar templates for the given language
        const openApi = getOpenApiSpec(inputPath);
        const openApiVersion = getOpenApiVersion(openApi);
        const templates = readHandlebarsTemplates(language);

        switch (language) {
            case Language.JAVASCRIPT:
            case Language.TYPESCRIPT:
                // Generate and write version 2 client
                if (openApiVersion === OpenApiVersion.V2) {
                    const clientV2 = parseV2(openApi);
                    writeClient(clientV2, language, templates, outputPath);
                }

                // Generate and write version 3 client
                if (openApiVersion === OpenApiVersion.V3) {
                    const clientV3 = parseV3(openApi);
                    writeClient(clientV3, language, templates, outputPath);
                }
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
