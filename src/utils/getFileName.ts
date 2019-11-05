import { Language } from '../index';

export function getFileName(fileName: string, language: Language): string {
    switch (language) {
        case Language.TYPESCRIPT:
            return `${fileName}.ts`;
        case Language.JAVASCRIPT:
            return `${fileName}.js`;
    }
    return fileName;
}
