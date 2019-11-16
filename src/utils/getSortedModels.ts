import { Model } from '../client/interfaces/Model';

export function getSortedModels(models: Map<string, Model>): string[] {
    return Array.from(models.values())
        .sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        })
        .map(model => model.name);
}
