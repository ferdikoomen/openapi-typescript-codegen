import type { Model } from '../../../client/interfaces/Model';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { PrimaryType } from './constants';
import { extendEnum } from './extendEnum';
import { getComment } from './getComment';
import { getEnum } from './getEnum';
import { getEnumFromDescription } from './getEnumFromDescription';
import { getModelDefault } from './getModelDefault';
import { getModelProperties } from './getModelProperties';
import { getPattern } from './getPattern';
import { getType } from './getType';
import { getRef } from './getRef';
import { getExternalReference, isLocalRef } from '../../../utils/refs';

export async function getModel(openApi: OpenApi, definition: OpenApiSchema, isDefinition: boolean = false, name: string = ''): Promise<Model> {
    const model: Model = {
        name: name,
        export: 'interface',
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
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
        if (isLocalRef(definition.$ref)) {
            const definitionRef = getType(definition.$ref);
            model.export = 'reference';
            model.type = definitionRef.type;
            model.base = definitionRef.base;
            model.template = definitionRef.template;
            model.imports.push(...definitionRef.imports);
            model.default = getModelDefault(definition, model);
            return model;
        } else {
            const resolvedDefinition = await getExternalReference<OpenApiSchema>(openApi.$meta, definition.$ref);
            return getModel(openApi, resolvedDefinition, isDefinition, name);
        }
    }

    if (definition.enum) {
        const enumerators = getEnum(definition.enum);
        const extendedEnumerators = extendEnum(enumerators, definition);
        if (extendedEnumerators.length) {
            model.export = 'enum';
            model.type = PrimaryType.STRING;
            model.base = PrimaryType.STRING;
            model.enum.push(...extendedEnumerators);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }

    if ((definition.type === 'int' || definition.type === 'integer') && definition.description) {
        const enumerators = getEnumFromDescription(definition.description);
        if (enumerators.length) {
            model.export = 'enum';
            model.type = PrimaryType.NUMBER;
            model.base = PrimaryType.NUMBER;
            model.enum.push(...enumerators);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }

    if (definition.type === 'array' && definition.items) {
        if (definition.items.$ref) {
            const arrayItems = getType(definition.items.$ref);
            model.export = 'array';
            model.type = arrayItems.type;
            model.base = arrayItems.base;
            model.template = arrayItems.template;
            model.imports.push(...arrayItems.imports);
            model.default = getModelDefault(definition, model);
            return model;
        } else {
            const arrayItems = await getModel(openApi, definition.items);
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
            const additionalProperties = getType(definition.additionalProperties.$ref);
            model.export = 'dictionary';
            model.type = additionalProperties.type;
            model.base = additionalProperties.base;
            model.template = additionalProperties.template;
            model.imports.push(...additionalProperties.imports);
            model.default = getModelDefault(definition, model);
            return model;
        } else {
            const additionalProperties = await getModel(openApi, definition.additionalProperties);
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
    //  Add correct support for oneOf, anyOf, allOf
    //  https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/

    if (definition.anyOf && definition.anyOf.length && !definition.properties) {
        model.export = 'generic';
        const compositionTypes = definition.anyOf.filter(type => type.$ref).map(type => getType(type.$ref));
        const composition = compositionTypes
            .map(type => type.type)
            .sort()
            .join(' | ');
        model.imports.push(...compositionTypes.map(type => type.base));
        model.type = composition;
        model.base = composition;
        return model;
    }

    if (definition.oneOf && definition.oneOf.length && !definition.properties) {
        model.export = 'generic';
        const compositionTypes = definition.oneOf.filter(type => type.$ref).map(type => getType(type.$ref));
        const composition = compositionTypes
            .map(type => type.type)
            .sort()
            .join(' | ');
        model.imports.push(...compositionTypes.map(type => type.base));
        model.type = composition;
        model.base = composition;
        return model;
    }

    if (definition.type === 'object' || definition.allOf) {
        model.export = 'interface';
        model.type = PrimaryType.OBJECT;
        model.base = PrimaryType.OBJECT;
        model.default = getModelDefault(definition, model);

        if (definition.allOf && definition.allOf.length) {
            for (const parent of definition.allOf) {
                if (parent.$ref) {
                    const parentRef = getType(parent.$ref);
                    model.extends.push(parentRef.base);
                    model.imports.push(parentRef.base);
                }
                if (parent.type === 'object' && parent.properties) {
                    const properties = await getModelProperties(openApi, parent, getModel);
                    properties.forEach(property => {
                        model.properties.push(property);
                        model.imports.push(...property.imports);
                        if (property.export === 'enum') {
                            model.enums.push(property);
                        }
                    });
                }
            }
        }

        if (definition.properties) {
            const properties = await getModelProperties(openApi, definition, getModel);
            properties.forEach(property => {
                model.properties.push(property);
                model.imports.push(...property.imports);
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
