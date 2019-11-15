import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getComment } from './getComment';
import { getType } from './getType';
import { Model } from '../../../client/interfaces/Model';
import { getValidationForRef } from './getValidationForRef';
import { getValidationForType } from './getValidationForType';
import { getValidationForArrayRef } from './getValidationForArrayRef';
import { getModelType } from './getModelType';
import { getModelValidation } from './getModelValidation';
import { getValidation } from './getValidation';
import { PrimaryType } from './constants';
import { getEnumType } from './getEnumType';
import { getEnumSymbols } from './getEnumSymbols';
import { getEnumValues } from './getEnumValues';
import { getEnumSymbolsFromDescription } from './getEnumSymbolsFromDescription';

export function getModel(openApi: OpenApi, definition: OpenApiSchema, definitionName: string = 'unknown'): Model {
    const result: Model = {
        isInterface: false,
        isType: false,
        isEnum: false,
        name: definitionName,
        type: 'any',
        base: 'any',
        template: null,
        validation: null,
        description: getComment(definition.description),
        extends: [],
        imports: [],
        enums: [],
        symbols: [],
        properties: [],
    };

    if (definition.$ref) {
        const definitionRef = getType(definition.$ref);
        result.isType = true;
        result.type = definitionRef.type;
        result.base = definitionRef.base;
        result.template = definitionRef.template;
        result.validation = getValidationForRef(definitionRef);
        result.imports.push(...definitionRef.imports);
        return result;
    }

    // If the param is a enum then return the values as an inline type.
    if (definition.enum) {
        const enumSymbols = getEnumSymbols(definition.enum);
        if (enumSymbols.length) {
            result.isEnum = true;
            result.symbols = enumSymbols;
            result.type = getEnumType(enumSymbols);
            result.base = PrimaryType.STRING;
            result.validation = `yup.mixed<${definitionName}>().oneOf([${getEnumValues(enumSymbols).join(', ')}])`;
            return result;
        }
        return result;
    }

    // If the param is a enum then return the values as an inline type.
    if (definition.type === 'int' && definition.description) {
        const enumSymbols = getEnumSymbolsFromDescription(definition.description);
        if (enumSymbols.length) {
            result.isEnum = true;
            result.symbols = enumSymbols;
            result.type = getEnumType(enumSymbols);
            result.base = PrimaryType.NUMBER;
            result.validation = `yup.mixed<${definitionName}>().oneOf([${getEnumValues(enumSymbols).join(', ')}])`;
            return result;
        }
        return result;
    }

    // If the schema is an Array type, we check for the child type,
    // so we can create a typed array, otherwise this will be a "any[]".
    if (definition.type === 'array' && definition.items) {
        if (definition.items.$ref) {
            const arrayItemsRef = getType(definition.items.$ref);
            result.imports.push(...arrayItemsRef.imports);
            result.isType = true;
            result.type = `${arrayItemsRef.type}[]`;
            result.base = arrayItemsRef.base;
            result.template = arrayItemsRef.template;
            result.validation = getValidationForArrayRef(arrayItemsRef);
            result.imports.push(...arrayItemsRef.imports);
        } else {
            const arrayItemsModel = getModel(openApi, definition.items);
            result.isType = true;
            result.type = `${arrayItemsModel.type}[]`;
            result.base = arrayItemsModel.base;
            result.template = arrayItemsModel.template;
            // result.validation = getValidationForArray(array.validation || 'any');
            result.imports.push(...arrayItemsModel.imports);
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
                for (const propertyName in parent.properties) {
                    if (parent.properties.hasOwnProperty(propertyName)) {
                        const property = parent.properties[propertyName];
                        const propertyRequired = !!(parent.required && parent.required.includes(propertyName));
                        const propertyReadOnly = !!property.readOnly;
                        if (property.$ref) {
                            const propertyRef = getType(property.$ref);
                            result.imports.push(...propertyRef.imports);
                            result.properties.push({
                                name: propertyName,
                                type: propertyRef.type,
                                required: propertyRequired,
                                nullable: false,
                                readOnly: propertyReadOnly,
                                description: property.description || null,
                                validation: getValidationForRef(propertyRef, propertyRequired),
                            });
                        } else {
                            const propertyModel = getModel(openApi, property);
                            result.imports.push(...propertyModel.imports);
                            result.properties.push({
                                name: propertyName,
                                type: propertyModel.type,
                                required: propertyRequired,
                                nullable: false,
                                readOnly: propertyReadOnly,
                                description: property.description || null,
                                validation: propertyModel.validation ? getValidation(propertyModel.validation, propertyRequired) : null,
                            });
                        }
                    }
                }
            }
        });

        // Validation needs to also check extended schema!
        // Check ModelThatExtends.ts
        result.isInterface = true;
        result.type = getModelType(result.properties);
        result.validation = getModelValidation(definitionName, result.properties);
        result.base = PrimaryType.OBJECT;
        result.template = null;
    }

    if (definition.type === 'object' && definition.properties) {
        for (const propertyName in definition.properties) {
            if (definition.properties.hasOwnProperty(propertyName)) {
                const property = definition.properties[propertyName];
                const propertyRequired = !!(definition.required && definition.required.includes(propertyName));
                const propertyReadOnly = !!property.readOnly;
                if (property.$ref) {
                    const propertyRef = getType(property.$ref);
                    result.imports.push(...propertyRef.imports);
                    result.properties.push({
                        name: propertyName,
                        type: propertyRef.type,
                        required: propertyRequired,
                        nullable: false,
                        readOnly: propertyReadOnly,
                        description: property.description || null,
                        validation: getValidationForRef(propertyRef, propertyRequired),
                    });
                } else {
                    const propertyModel = getModel(openApi, property);
                    result.imports.push(...propertyModel.imports);
                    result.properties.push({
                        name: propertyName,
                        type: propertyModel.type,
                        required: propertyRequired,
                        nullable: false,
                        readOnly: propertyReadOnly,
                        description: property.description || null,
                        validation: propertyModel.validation ? getValidation(propertyModel.validation, propertyRequired) : null,
                    });
                }
            }
        }

        result.isInterface = true;
        result.type = getModelType(result.properties);
        result.validation = getModelValidation(definitionName, result.properties);
        result.base = PrimaryType.OBJECT;
        result.template = null;
        return result;
    }

    // If the schema has a type than it can be a basic or generic type.
    if (definition.type !== 'object' && definition.type) {
        const definitionType = getType(definition.type);
        result.isType = true;
        result.type = definitionType.type;
        result.base = definitionType.base;
        result.template = definitionType.template;
        result.validation = getValidationForType(definitionType);
        result.imports.push(...definitionType.imports);
        return result;
    }

    return result;
}
