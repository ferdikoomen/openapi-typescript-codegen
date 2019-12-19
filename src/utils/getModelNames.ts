import { Model } from '../client/interfaces/Model';

export function getModelNames(models: Model[]): string[] {
    return models
        .map(model => model.name)
        .sort((a, b) => {
            const nameA = a.toLowerCase();
            const nameB = b.toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        });
}
