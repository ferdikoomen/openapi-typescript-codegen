import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getComment } from './getComment';
import { getType } from './getType';
import { Model } from '../../../client/interfaces/Model';
import { PrimaryType } from './constants';
import { getEnumType } from './getEnumType';
import { getEnum } from './getEnum';
import { getEnumFromDescription } from './getEnumFromDescription';
import { getModelProperties } from './getModelProperties';

export function getModel(openApi: OpenApi, definition: OpenApiSchema, name: string = ''): Model {
    const result: Model = {
        name,
        export: 'interface',
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        link: null,
        description: getComment(definition.description),
        readOnly: definition.readOnly || false,
        required: false,
        nullable: false,
        imports: [],
        extends: [],
        enum: [],
        enums: [],
        properties: [],
    };

    if (definition.$ref) {
        const definitionRef = getType(definition.$ref);
        result.export = 'reference';
        result.type = definitionRef.type;
        result.base = definitionRef.base;
        result.template = definitionRef.template;
        result.imports.push(...definitionRef.imports);
        return result;
    }

    if (definition.enum) {
        const enumerators = getEnum(definition.enum);
        if (enumerators.length) {
            result.export = 'enum';
            result.type = getEnumType(enumerators);
            result.base = PrimaryType.STRING;
            result.enum.push(...enumerators);
            return result;
        }
    }

    if (definition.type === 'int' && definition.description) {
        const enumerators = getEnumFromDescription(definition.description);
        if (enumerators.length) {
            result.export = 'enum';
            result.type = getEnumType(enumerators);
            result.base = PrimaryType.NUMBER;
            result.enum.push(...enumerators);
            return result;
        }
    }

    if (definition.type === 'array' && definition.items) {
        if (definition.items.$ref) {
            const arrayItems = getType(definition.items.$ref);
            result.export = 'array';
            result.type = arrayItems.type;
            result.base = arrayItems.base;
            result.template = arrayItems.template;
            result.imports.push(...arrayItems.imports);
        } else {
            const arrayItems = getModel(openApi, definition.items);
            result.export = 'array';
            result.type = arrayItems.type;
            result.base = arrayItems.base;
            result.template = arrayItems.template;
            result.link = arrayItems;
            result.imports.push(...arrayItems.imports);
        }
        return result;
    }

    if (definition.type === 'object' && definition.additionalProperties && typeof definition.additionalProperties === 'object') {
        if (definition.additionalProperties.$ref) {
            const additionalProperties = getType(definition.additionalProperties.$ref);
            result.export = 'dictionary';
            result.type = additionalProperties.type;
            result.base = additionalProperties.base;
            result.template = additionalProperties.template;
            result.imports.push(...additionalProperties.imports);
        } else {
            const additionalProperties = getModel(openApi, definition.additionalProperties);
            result.export = 'dictionary';
            result.type = additionalProperties.type;
            result.base = additionalProperties.base;
            result.template = additionalProperties.template;
            result.link = additionalProperties;
            result.imports.push(...additionalProperties.imports);
        }
        return result;
    }

    if (definition.allOf) {
        definition.allOf.forEach(parent => {
            if (parent.$ref) {
                const parentRef = getType(parent.$ref);
                result.extends.push(parentRef.type);
                result.imports.push(parentRef.base);
            }
            if (parent.type === 'object' && parent.properties) {
                const properties = getModelProperties(openApi, parent);
                properties.forEach(property => {
                    result.properties.push(property);
                    result.imports.push(...property.imports);
                });
            }
        });
        result.export = 'interface';
        result.type = PrimaryType.OBJECT;
        result.base = PrimaryType.OBJECT;
    }

    if (definition.type === 'object' && definition.properties) {
        const properties = getModelProperties(openApi, definition);
        properties.forEach(property => {
            result.properties.push(property);
            result.imports.push(...property.imports);
        });
        result.export = 'interface';
        result.type = PrimaryType.OBJECT;
        result.base = PrimaryType.OBJECT;
        return result;
    }

    // If the schema has a type than it can be a basic or generic type.
    if (definition.type) {
        const definitionType = getType(definition.type);
        result.export = 'generic';
        result.type = definitionType.type;
        result.base = definitionType.base;
        result.template = definitionType.template;
        result.imports.push(...definitionType.imports);
        return result;
    }

    return result;
}
