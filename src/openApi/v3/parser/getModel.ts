import type { Model } from '../../../client/interfaces/Model';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import type { Type } from '../../../client/interfaces/Type';
import { PrimaryType } from './constants';
import { extendEnum } from './extendEnum';
import { getComment } from './getComment';
import { getEnum } from './getEnum';
import { getEnumFromDescription } from './getEnumFromDescription';
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
        return getModel(openApi, resolvedDefinition, isDefinition, name);
    }
};

export async function getModel(openApi: OpenApi, definition: OpenApiSchema, isDefinition: boolean = false, name: string = ''): Promise<Model> {
    const model: Model = {
        name: name,
        export: 'interface',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: getComment(definition.description),
        isDefinition: isDefinition,
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
        extends: [],
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

    if (definition.type === 'object' && definition.additionalProperties && typeof definition.additionalProperties === 'object') {
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
    // TODO:
    //  Add correct support for oneOf
    //  https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/

    if (definition.oneOf?.length || definition.anyOf?.length || definition.allOf?.length) {
        let types: OpenApiSchema[] = [];
        if (definition.oneOf?.length) {
            model.export = 'one-of';
            types = definition.oneOf;
        } else if (definition.anyOf?.length) {
            model.export = 'any-of';
            types = definition.anyOf;
        } else if (definition.allOf?.length) {
            model.export = 'all-of';
            types = definition.allOf;
        }
        const compositionTypes = types.map(model => getModel(openApi, model));
        model.properties = compositionTypes;
        model.imports.push(...compositionTypes.reduce((acc: string[], type) => acc.concat(type.imports), []));
        model.enums.push(...compositionTypes.reduce((acc: Model[], type) => acc.concat(type.enums), []));
        return model;
    }

    if (definition.type === 'object') {
        model.export = 'interface';
        model.type = 'any';
        model.base = 'any';
        model.default = getModelDefault(definition, model);
        const properties = await getModelProperties(openApi, definition, getModel);
        properties.forEach(property => {
            model.properties.push(property);
            model.imports.push(...property.imports);
            if (property.export === 'enum') {
                model.enums.push(property);
            }
        });
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
