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
        enums: model.enums.filter((property, index, arr) => {
            return arr.findIndex(item => item.name === property.name) === index;
        }),
        enum: model.enum.filter((enumerator, index, arr) => {
            return arr.findIndex(item => item.name === enumerator.name) === index;
        }),
    };
}
