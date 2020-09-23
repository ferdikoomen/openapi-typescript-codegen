import { Client } from '../client/interfaces/Client';
import { Model } from '../client/interfaces/Model';
import { postProcessModelEnum } from './postProcessModelEnum';
import { postProcessModelEnums } from './postProcessModelEnums';
import { postProcessModelImports } from './postProcessModelImports';
import { postProcessUnionTypes } from './postProcessUnionTypes';

function convertEnumsToUnion(properties: Model[]): Model[] {
    return properties.map(property => {
        if (property.export === 'enum') {
            return {
                ...property,
                export: 'generic',
                base: property.enum.map(enumeration => enumeration.value).join(' | '),
                enum: [],
            };
        }
        return property;
    });
}
/**
 * Post process the model. If needed this will convert types to union types,
 * see the "useUnionTypes" flag in the documentation. Plus this will cleanup
 * any double imports or enum values.
 * @param model
 * @param client
 * @param useUnionTypes
 */
export function postProcessModel(model: Model, client: Client, useUnionTypes: boolean, useUnionTypesForEnums: boolean): Model {
    const clone = postProcessUnionTypes(model, client, useUnionTypes);

    return {
        ...clone,
        imports: postProcessModelImports(clone),
        enums: useUnionTypesForEnums ? [] : postProcessModelEnums(clone),
        enum: useUnionTypesForEnums ? [] : postProcessModelEnum(clone),
        properties: useUnionTypesForEnums ? convertEnumsToUnion(clone.properties) : clone.properties,
    };
}
