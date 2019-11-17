import { Model } from '../client/interfaces/Model';

export function exportModel(model: Model): any {
    return {
        ...model,
        imports: model.imports
            .filter(name => {
                return model.name !== name;
            })
            .filter((name, index, arr) => {
                return arr.indexOf(name) === index;
            })
            .sort((a, b) => {
                const nameA = a.toLowerCase();
                const nameB = b.toLowerCase();
                return nameA.localeCompare(nameB);
            }),
        properties: model.properties
            .map(property => exportModel(property))
            .filter(property => property.enum.length)
            .filter((property, index, arr) => {
                return arr.findIndex(item => item.name === property.name) === index;
            })
            .sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return nameA.localeCompare(nameB);
            }),
        enums: model.properties
            .map(property => exportModel(property))
            .filter(property => !property.enum.length)
            .filter((property, index, arr) => {
                return arr.findIndex(item => item.name === property.name) === index;
            })
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
