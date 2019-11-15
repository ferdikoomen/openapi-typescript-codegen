import { getSortedImports } from './getSortedImports';
import { Model } from '../client/interfaces/Model';

export function cleanupModels(models: Model[]): Model[] {
    models.forEach((models: Model): void => {
        models.imports = getSortedImports(models.imports);
    });
    return models;
}
