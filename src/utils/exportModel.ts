import { getSortedImports } from './getSortedImports';
import { Model } from '../client/interfaces/Model';

export function exportModel(model: Model): any {
    return {
        ...model,
        imports: getSortedImports(model.imports).filter(name => {
            return model.name !== name;
        }),
        properties: Array.from(model.properties.values())
            .filter((property, index, arr) => {
                return arr.findIndex(item => item.name === property.name) === index;
            })
            .sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return nameA.localeCompare(nameB);
            }),
    };
}
