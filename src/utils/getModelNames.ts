import { Model } from '../client/interfaces/Model';

export function getModelNames(models: Map<string, Model>): string[] {
    return Array.from(models.values())
        .map(model => model.name)
        .concat(['Dictionary'])
        .sort((a, b) => {
            const nameA = a.toLowerCase();
            const nameB = b.toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        });
}
