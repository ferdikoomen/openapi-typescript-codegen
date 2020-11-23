import type { Model } from '../../../client/interfaces/Model';
import { getExternalReference, getRelativeReference, isFormalRef, isLocalRef } from '../../../utils/refs';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { escapeName } from './escapeName';
import { getComment } from './getComment';
import type { getModel } from './getModel';
import { getPattern } from './getPattern';
import { getType } from './getType';

// Fix for circular dependency
export type GetModelFn = typeof getModel;

export const resolveModelPropertyReference = async (openApi: OpenApi, definition: OpenApiSchema, propertyName: string, propertyRequired: boolean, ref: string, getModel: GetModelFn): Promise<Model> => {
    let model: Model;
    if (isLocalRef(ref)) {
        if (isFormalRef(ref)) {
            const propertyRef = getType(ref);
            model = {
                name: escapeName(propertyName),
                export: 'reference',
                type: propertyRef.type,
                base: propertyRef.base,
                template: propertyRef.template,
                link: null,
                description: getComment(''),
                isDefinition: false,
                // These properties are filled out to satisfy the Model type, but should otherwise be ignored
                // as this is a reference
                isReadOnly: false,
                isRequired: propertyRequired,
                isNullable: false,
                // end of canned properties
                imports: propertyRef.imports,
                enum: [],
                enums: [],
                properties: [],
            };
        } else {
            const internalDefinition = getRelativeReference<OpenApiSchema>(openApi, ref);
            model = await getModel(openApi, internalDefinition, false, propertyName);
        }
    } else {
        const resolvedDefinition = await getExternalReference<OpenApiSchema>(definition.$meta, ref);
        const url = new URL(ref.slice(ref.indexOf('#')), resolvedDefinition.$meta.baseUri);
        if (url.hash) {
            return resolveModelPropertyReference(openApi, resolvedDefinition, propertyName, propertyRequired, url.hash, getModel);
        }
        model = await getModel(openApi, resolvedDefinition, false, propertyName);
    }
    return model;
};

export async function getModelProperties(openApi: OpenApi, definition: OpenApiSchema, getModel: GetModelFn): Promise<Model[]> {
    const models: Model[] = [];
    for (const propertyName in definition.properties) {
        if (definition.properties.hasOwnProperty(propertyName)) {
            const property = definition.properties[propertyName];
            const propertyRequired = Boolean(definition.required?.includes(propertyName));
            if (property.$ref) {
                const model = await resolveModelPropertyReference(openApi, definition, propertyName, propertyRequired, property.$ref, getModel);
                models.push(model);
            } else {
                const model = await getModel(openApi, property);
                models.push({
                    name: escapeName(propertyName),
                    export: model.export,
                    type: model.type,
                    base: model.base,
                    template: model.template,
                    link: model.link,
                    description: getComment(property.description),
                    isDefinition: false,
                    isReadOnly: property.readOnly === true,
                    isRequired: propertyRequired === true,
                    isNullable: property.nullable === true,
                    format: property.format,
                    maximum: property.maximum,
                    exclusiveMaximum: property.exclusiveMaximum,
                    minimum: property.minimum,
                    exclusiveMinimum: property.exclusiveMinimum,
                    multipleOf: property.multipleOf,
                    maxLength: property.maxLength,
                    minLength: property.minLength,
                    maxItems: property.maxItems,
                    minItems: property.minItems,
                    uniqueItems: property.uniqueItems,
                    maxProperties: property.maxProperties,
                    minProperties: property.minProperties,
                    pattern: getPattern(property.pattern),
                    imports: model.imports,
                    enum: model.enum,
                    enums: model.enums,
                    properties: model.properties,
                });
            }
        }
    }

    return models;
}
