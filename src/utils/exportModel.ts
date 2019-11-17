import { Model } from '../client/interfaces/Model';

export function exportModel(model: Model): Model {
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
            //  .map(property => exportModel(property))
            //  .filter((property, index, arr) => {
            //      return arr.findIndex(item => item.name === property.name) === index;
            //  })
            .sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return nameA.localeCompare(nameB);
            }),
        enums: model.enums
            .map(property => exportModel(property))
            .filter((property, index, arr) => {
                return arr.findIndex(item => item.name === property.name) === index;
            })
            .sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return nameA.localeCompare(nameB);
            }),
        enum: model.enum
            .filter((enumerator, index, arr) => {
                return arr.findIndex(item => item.name === enumerator.name) === index;
            })
            .sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return nameA.localeCompare(nameB);
            }),
    };
}
