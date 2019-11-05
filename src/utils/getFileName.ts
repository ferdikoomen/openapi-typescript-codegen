import { Language } from '../index';

/**
 * Get the correct file name and extension for a given language.
 * @param fileName Any file name.
 * @param language Typescript or Javascript.
 */
export function getFileName(fileName: string, language: Language): string {
    switch (language) {
        case Language.TYPESCRIPT:
            return `${fileName}.ts`;
        case Language.JAVASCRIPT:
            return `${fileName}.js`;
    }
    return fileName;
}
