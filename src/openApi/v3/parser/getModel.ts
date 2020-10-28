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

export function getModel(openApi: OpenApi, definition: OpenApiSchema, isDefinition: boolean = false, name: string = ''): Model {
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
        const definitionRef = getType(definition.$ref);
        model.export = 'reference';
        model.type = definitionRef.type;
        model.base = definitionRef.base;
        model.template = definitionRef.template;
        model.imports.push(...definitionRef.imports);
        model.default = getModelDefault(definition, model);
        return model;
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
            const arrayItems = getModel(openApi, definition.items);
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
            const additionalProperties = getModel(openApi, definition.additionalProperties);
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

    if (definition.anyOf && definition.anyOf.length) {
        model.export = 'generic';
        const compositionItems = definition.anyOf
            .map(d => getModel(openApi, d));
        const composition = compositionItems
            .map(t => {
                if (t.enum.length > 0) {
                    return t.enum.map(e => e.value).join(' | ');
                }
                if (t.properties.length > 0) {
                    return t.properties.length === 1 ? t.properties.map(p => `{ ${p.name}: ${getType(p.type).type} }`) : `{ ${t.properties.map(p => `${p.name}: ${getType(p.type).type} `)} }`;
                }
                return t.type;
            })
            .sort()
            .join(' | ');
        model.type = composition;
        model.base = composition;
        const iter = compositionItems.reduce((prev, cur) => {
            return {
                imports: [...(prev.imports || []), ...cur.imports],
                extends: [...(prev.extends || []), ...cur.extends],
                enum: [...(prev.enum || []), ...cur.enum],
                enums: [...(prev.enums || []), ...cur.enums],
                properties: [...(prev.properties || []), ...cur.properties],
            };
        }, {} as any) as Model;
        model.imports = iter.imports;
        model.extends = iter.extends;
        model.enum = iter.enum;
        model.enums = iter.enums;
        model.properties = iter.properties;

        return model;
    }


    if (definition.oneOf && definition.oneOf.length) {
        model.export = 'generic';
        const compositionItems = definition.oneOf
            .map(d => getModel(openApi, d));
        const composition = compositionItems
            .map(t => {
                if (t.enum.length > 0) {
                    return t.enum.map(e => e.value).join(' | ');
                }
                if (t.properties.length > 0) {
                    return t.properties.length === 1 ? t.properties.map(p => `{ ${p.name}: ${getType(p.type).type} }`) : `{ ${t.properties.map(p => `${p.name}: ${getType(p.type).type} `)} }`;
                }
                return t.type;
            })
            .sort()
            .join(' | ');
        model.type = composition;
        model.base = composition;
        const iter = compositionItems.reduce((prev, cur) => {
            return {
                imports: [...(prev.imports || []), ...cur.imports],
                extends: [...(prev.extends || []), ...cur.extends],
                enum: [...(prev.enum || []), ...cur.enum],
                enums: [...(prev.enums || []), ...cur.enums],
                properties: [...(prev.properties || []), ...cur.properties],
            };
        }, {} as any) as Model;
        model.imports = iter.imports;
        model.extends = iter.extends;
        model.enum = iter.enum;
        model.enums = iter.enums;
        model.properties = iter.properties;

        return model;
    }


    if (definition.type === 'object' || definition.allOf) {
        model.export = 'interface';
        model.type = PrimaryType.OBJECT;
        model.base = PrimaryType.OBJECT;
        model.default = getModelDefault(definition, model);

        if (definition.allOf && definition.allOf.length) {
            definition.allOf.forEach(parent => {
                if (parent.$ref) {
                    const parentRef = getType(parent.$ref);
                    model.extends.push(parentRef.base);
                    model.imports.push(parentRef.base);
                }
                if (parent.type === 'object' && parent.properties) {
                    const properties = getModelProperties(openApi, parent, getModel);
                    properties.forEach(property => {
                        model.properties.push(property);
                        model.imports.push(...property.imports);
                        if (property.export === 'enum') {
                            model.enums.push(property);
                        }
                    });
                }
            });
        }

        if (definition.properties) {
            const properties = getModelProperties(openApi, definition, getModel);
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
