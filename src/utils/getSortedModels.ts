import { Model } from '../client/interfaces/Model';

export function getSortedModels(models: Model[]): Model[] {
    return models.sort((a, b) => {
        const nameA: string = a.name.toLowerCase();
        const nameB: string = b.name.toLowerCase();
        return nameA.localeCompare(nameB, 'en');
    });
}
