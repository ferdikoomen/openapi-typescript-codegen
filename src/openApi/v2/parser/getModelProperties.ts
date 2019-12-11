import { Model } from '../../../client/interfaces/Model';
import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getComment } from './getComment';
import { getModel } from './getModel';
import { getType } from './getType';

export function getModelProperties(openApi: OpenApi, definition: OpenApiSchema): Model[] {
    const models: Model[] = [];
    for (const propertyName in definition.properties) {
        if (definition.properties.hasOwnProperty(propertyName)) {
            const property = definition.properties[propertyName];
            const propertyRequired = definition.required && definition.required.includes(propertyName);
            if (property.$ref) {
                const model = getType(property.$ref);
                models.push({
                    name: propertyName,
                    export: 'reference',
                    type: model.type,
                    base: model.base,
                    template: model.template,
                    link: null,
                    description: getComment(property.description),
                    isProperty: true,
                    isReadOnly: property.readOnly === true,
                    isRequired: propertyRequired === true,
                    isNullable: false,
                    format: property.format,
                    maximum: property.maximum,
                    exclusiveMaximum: property.exclusiveMaximum,
                    minimum: property.minimum,
                    exclusiveMinimum: property.exclusiveMinimum,
                    multipleOf: property.multipleOf,
                    maxLength: property.maxLength,
                    minLength: property.minLength,
                    pattern: property.pattern,
                    maxItems: property.maxItems,
                    minItems: property.minItems,
                    uniqueItems: property.uniqueItems,
                    maxProperties: property.maxProperties,
                    minProperties: property.minProperties,
                    imports: model.imports,
                    extends: [],
                    enum: [],
                    enums: [],
                    properties: [],
                });
            } else {
                const model = getModel(openApi, property);
                models.push({
                    name: propertyName,
                    export: model.export,
                    type: model.type,
                    base: model.base,
                    template: model.template,
                    link: model.link,
                    description: getComment(property.description),
                    isProperty: true,
                    isReadOnly: property.readOnly === true,
                    isRequired: propertyRequired === true,
                    isNullable: false,
                    format: property.format,
                    maximum: property.maximum,
                    exclusiveMaximum: property.exclusiveMaximum,
                    minimum: property.minimum,
                    exclusiveMinimum: property.exclusiveMinimum,
                    multipleOf: property.multipleOf,
                    maxLength: property.maxLength,
                    minLength: property.minLength,
                    pattern: property.pattern,
                    maxItems: property.maxItems,
                    minItems: property.minItems,
                    uniqueItems: property.uniqueItems,
                    maxProperties: property.maxProperties,
                    minProperties: property.minProperties,
                    imports: model.imports,
                    extends: model.extends,
                    enum: model.enum,
                    enums: model.enums,
                    properties: model.properties,
                });
            }
        }
    }

    return models;
}
