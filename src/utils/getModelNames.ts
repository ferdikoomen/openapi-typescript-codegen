import { Language } from '../index';
import { Model } from '../client/interfaces/Model';

export function getModelNames(models: Model[], language: Language): string[] {
    return models
        .map(model => model.name)
        .concat(language === Language.TYPESCRIPT ? ['Dictionary'] : [])
        .sort((a, b) => {
            const nameA = a.toLowerCase();
            const nameB = b.toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        });
}
