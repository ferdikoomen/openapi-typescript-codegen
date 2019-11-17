import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getComment } from './getComment';
import { getType } from './getType';
import { Model } from '../../../client/interfaces/Model';
import { PrimaryType } from './constants';
import { getEnumType } from './getEnumType';
import { getEnum } from './getEnum';
import { getEnumFromDescription } from './getEnumFromDescription';
import { getTypeFromProperties } from './getTypeFromProperties';
import { getModelProperties } from './getModelProperties';

export function getModel(openApi: OpenApi, definition: OpenApiSchema, name: string = ''): Model {
    const result: Model = {
        name,
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        description: getComment(definition.description),
        readOnly: definition.readOnly,
        imports: [],
        extends: [],
        enum: [],
        properties: [],
    };

    if (definition.$ref) {
        const definitionRef = getType(definition.$ref);
        result.type = definitionRef.type;
        result.base = definitionRef.base;
        result.template = definitionRef.template;
        result.imports.push(...definitionRef.imports);
        result.validation = {
            type: 'ref',
        };
        return result;
    }

    // If the param is a enum then return the values as an inline type.
    if (definition.enum) {
        const enumerators = getEnum(definition.enum);
        if (enumerators.length) {
            result.type = getEnumType(enumerators);
            result.base = PrimaryType.STRING;
            result.enum.push(...enumerators);
            result.validation = {
                type: 'enum',
            };
            return result;
        }
        return result;
    }

    // If the param is a enum then return the values as an inline type.
    if (definition.type === 'int' && definition.description) {
        const enumerators = getEnumFromDescription(definition.description);
        if (enumerators.length) {
            result.type = getEnumType(enumerators);
            result.base = PrimaryType.NUMBER;
            result.enum.push(...enumerators);
            result.validation = {
                type: 'enum',
            };
            return result;
        }
        return result;
    }

    // If the schema is an Array type, we check for the child type,
    // so we can create a typed array, otherwise this will be a "any[]".
    if (definition.type === 'array' && definition.items) {
        if (definition.items.$ref) {
            const arrayItems = getType(definition.items.$ref);
            result.type = `${arrayItems.type}[]`;
            result.base = arrayItems.base;
            result.template = arrayItems.template;
            result.imports.push(...arrayItems.imports);
            result.validation = {
                type: 'array',
                childType: arrayItems.type,
                childBase: arrayItems.base,
            };
        } else {
            const arrayItems = getModel(openApi, definition.items);
            result.type = `${arrayItems.type}[]`;
            result.base = arrayItems.base;
            result.template = arrayItems.template;
            result.imports.push(...arrayItems.imports);
            result.validation = {
                type: 'array',
                childType: arrayItems.type,
                childBase: arrayItems.base,
                childValidation: arrayItems.validation,
            };
        }
        return result;
    }

    // If a property has additionalProperties, then it likely to be a dictionary type.
    // In that case parse the related property and assume it lives inside a string
    // based dictionary: { [key:string]: MyType }
    if (definition.type === 'object' && definition.additionalProperties && typeof definition.additionalProperties === 'object') {
        if (definition.additionalProperties.$ref) {
            const additionalProperties = getType(definition.additionalProperties.$ref);
            result.type = `Dictionary<${additionalProperties.type}>`;
            result.base = 'Dictionary';
            result.template = additionalProperties.type;
            result.imports.push(...additionalProperties.imports);
            result.validation = {
                type: 'dictionary',
                childType: additionalProperties.type,
                childBase: additionalProperties.base,
            };
        } else {
            const additionalProperties = getModel(openApi, definition.additionalProperties);
            result.type = `Dictionary<${additionalProperties.type}>`;
            result.base = 'Dictionary';
            result.template = additionalProperties.type;
            result.imports.push(...additionalProperties.imports);
            result.validation = {
                type: 'dictionary',
                childType: additionalProperties.type,
                childBase: additionalProperties.base,
                childValidation: additionalProperties.validation,
            };
        }
        return result;
    }

    // Check if this model extends other models
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
        result.type = getTypeFromProperties(result.properties);
        result.base = PrimaryType.OBJECT;
        result.validation = {
            type: 'model',
        };
    }

    if (definition.type === 'object' && definition.properties) {
        const properties = getModelProperties(openApi, definition);
        properties.forEach(property => {
            result.properties.push(property);
            result.imports.push(...property.imports);
        });
        result.type = getTypeFromProperties(result.properties);
        result.base = PrimaryType.OBJECT;
        result.validation = {
            type: 'model',
        };
        return result;
    }

    // If the schema has a type than it can be a basic or generic type.
    if (definition.type) {
        const definitionType = getType(definition.type);
        result.type = definitionType.type;
        result.base = definitionType.base;
        result.template = definitionType.template;
        result.imports.push(...definitionType.imports);
        result.validation = {
            type: 'type',
        };
        return result;
    }

    return result;
}
