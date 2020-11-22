import type { Model } from '../../../client/interfaces/Model';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import type { Type } from '../../../client/interfaces/Type';
import { extendEnum } from './extendEnum';
import { getComment } from './getComment';
import { getEnum } from './getEnum';
import { getEnumFromDescription } from './getEnumFromDescription';
import { getModelComposition } from './getModelComposition';
import { getModelDefault } from './getModelDefault';
import { getModelProperties } from './getModelProperties';
import { getPattern } from './getPattern';
import { getType } from './getType';
import { getExternalReference, getRelativeReference, isFormalRef, isLocalRef, withCurrentMeta } from '../../../utils/refs';

export const resolveModelReference = async (openApi: OpenApi, definition: OpenApiSchema, ref: string, isDefinition: boolean = false, name: string = '', createFormalRef: (t: Type) => Model): Promise<Model> => {
    if (isLocalRef(ref)) {
        if (isFormalRef(ref)) {
            const t = getType(ref);
            return createFormalRef(t);
        } else {
            const internalDefinition = getRelativeReference<OpenApiSchema>(openApi, ref);
            return getModel(openApi, internalDefinition);
        }
    } else {
        const resolvedDefinition = await getExternalReference<OpenApiSchema>(definition.$meta, ref);
        const url = new URL(ref.slice(ref.indexOf('#')), resolvedDefinition.$meta.baseUri);
        if (url.hash) {
            return resolveModelReference(openApi, resolvedDefinition, url.hash, isDefinition, name, createFormalRef);
        } else {
            return getModel(openApi, resolvedDefinition, isDefinition, name);
        }
    }
};

export async function getModel(openApi: OpenApi, definition: OpenApiSchema, isDefinition: boolean = false, name: string = ''): Promise<Model> {
    const model: Model = {
        name,
        export: 'interface',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: getComment(definition.description),
        isDefinition,
        isReadOnly: definition.readOnly === true,
        isNullable: definition.nullable === true,
        isRequired: false,
        format: definition.format,
        maximum: definition.maximum,
        exclusiveMaximum: definition.exclusiveMaximum,
        minimum: definition.minimum,
        exclusiveMinimum: definition.exclusiveMinimum,
        multipleOf: definition.multipleOf,
        maxLength: definition.maxLength,
        minLength: definition.minLength,
        maxItems: definition.maxItems,
        minItems: definition.minItems,
        uniqueItems: definition.uniqueItems,
        maxProperties: definition.maxProperties,
        minProperties: definition.minProperties,
        pattern: getPattern(definition.pattern),
        imports: [],
        enum: [],
        enums: [],
        properties: [],
    };

    if (definition.$ref) {
        return resolveModelReference(openApi, definition, definition.$ref, isDefinition, name, definitionRef => {
            model.export = 'reference';
            model.type = definitionRef.type;
            model.base = definitionRef.base;
            model.template = definitionRef.template;
            model.imports.push(...definitionRef.imports);
            model.default = getModelDefault(definition, model);
            return model;
        });
    }

    if (definition.enum) {
        const enumerators = getEnum(definition.enum);
        const extendedEnumerators = extendEnum(enumerators, definition);
        if (extendedEnumerators.length) {
            model.export = 'enum';
            model.type = 'string';
            model.base = 'string';
            model.enum.push(...extendedEnumerators);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }

    if ((definition.type === 'int' || definition.type === 'integer') && definition.description) {
        const enumerators = getEnumFromDescription(definition.description);
        if (enumerators.length) {
            model.export = 'enum';
            model.type = 'number';
            model.base = 'number';
            model.enum.push(...enumerators);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }

    if (definition.type === 'array' && definition.items) {
        if (definition.items.$ref) {
            return resolveModelReference(openApi, definition, definition.items.$ref, isDefinition, name, arrayItems => {
                model.export = 'array';
                model.type = arrayItems.type;
                model.base = arrayItems.base;
                model.template = arrayItems.template;
                model.imports.push(...arrayItems.imports);
                model.default = getModelDefault(definition, model);
                return model;
            });
        } else {
            const arrayItems = await getModel(openApi, withCurrentMeta(definition.items, definition.$meta));
            model.export = 'array';
            model.type = arrayItems.type;
            model.base = arrayItems.base;
            model.template = arrayItems.template;
            model.link = arrayItems;
            model.imports.push(...arrayItems.imports);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }

    if (definition.type === 'object' && typeof definition.additionalProperties === 'object') {
        if (definition.additionalProperties.$ref) {
            return resolveModelReference(openApi, definition, definition.additionalProperties.$ref, isDefinition, name, additionalProperties => {
                model.export = 'dictionary';
                model.type = additionalProperties.type;
                model.base = additionalProperties.base;
                model.template = additionalProperties.template;
                model.imports.push(...additionalProperties.imports);
                model.default = getModelDefault(definition, model);
                return model;
            });
        } else {
            const additionalProperties = await getModel(openApi, withCurrentMeta(definition.additionalProperties, definition.$meta));
            model.export = 'dictionary';
            model.type = additionalProperties.type;
            model.base = additionalProperties.base;
            model.template = additionalProperties.template;
            model.link = additionalProperties;
            model.imports.push(...additionalProperties.imports);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }

    if (definition.oneOf?.length) {
        const composition = await getModelComposition(openApi, definition.oneOf, 'one-of', getModel);
        model.export = composition.type;
        model.imports.push(...composition.imports);
        model.enums.push(...composition.enums);
        model.properties.push(...composition.properties);
        return model;
    }

    if (definition.anyOf?.length) {
        const composition = await getModelComposition(openApi, definition.anyOf, 'any-of', getModel);
        model.export = composition.type;
        model.imports.push(...composition.imports);
        model.enums.push(...composition.enums);
        model.properties.push(...composition.properties);
        return model;
    }

    if (definition.allOf?.length) {
        const composition = await getModelComposition(openApi, definition.allOf, 'all-of', getModel);
        model.export = composition.type;
        model.imports.push(...composition.imports);
        model.enums.push(...composition.enums);
        model.properties.push(...composition.properties);
        return model;
    }

    if (definition.type === 'object') {
        model.export = 'interface';
        model.type = 'any';
        model.base = 'any';

        if (definition.properties) {
            model.default = getModelDefault(definition, model);
            const properties = await getModelProperties(openApi, definition, getModel);
            properties.forEach(property => {
                model.imports.push(...property.imports);
                model.properties.push(property);
                if (property.export === 'enum') {
                    model.enums.push(property);
                }
            });
        }
        return model;
    }

    // If the schema has a type than it can be a basic or generic type.
    if (definition.type) {
        const definitionType = getType(definition.type);
        model.export = 'generic';
        model.type = definitionType.type;
        model.base = definitionType.base;
        model.template = definitionType.template;
        model.imports.push(...definitionType.imports);
        model.default = getModelDefault(definition, model);
        return model;
    }

    return model;
}
