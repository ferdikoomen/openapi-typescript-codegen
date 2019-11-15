import { getSortedImports } from './getSortedImports';
import { Model } from '../client/interfaces/Model';

export function cleanupModels(models: Model[]): Model[] {
    models.forEach(model => {
        model.imports = getSortedImports(model.imports).filter(name => {
            return model.name !== name;
        });
        model.properties = model.properties
            .filter((property, index, arr) => {
                return arr.findIndex(item => item.name === property.name) === index;
            })
            .sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return nameA.localeCompare(nameB);
            });
    });
    return models;
}
