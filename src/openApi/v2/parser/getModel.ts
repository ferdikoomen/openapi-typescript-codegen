import {OpenApi} from '../interfaces/OpenApi';
import {OpenApiSchema} from '../interfaces/OpenApiSchema';
import {getComment} from './getComment';
import {getType} from './getType';
import {Model} from '../../../client/interfaces/Model';
import {PrimaryType} from './constants';
import {getEnumType} from './getEnumType';
import {getEnum} from './getEnum';
import {getEnumFromDescription} from './getEnumFromDescription';
import {getTypeFromProperties} from './getTypeFromProperties';
import {getValidationForRef} from './getValidationForRef';
import {getValidationForEnum} from './getValidationForEnum';
import {getValidationForArrayRef} from './getValidationForArrayRef';
import {getValidationForType} from './getValidationForType';
import {getValidationForArray} from './getValidationForArray';
import {getValidationForProperties} from './getValidationForProperties';

export function getModel(openApi: OpenApi, definition: OpenApiSchema, name: string = ''): Model {
    // TODO: Properties now contain ALL properties, so we need to filter out enums
    // before we render the file, plus we need to calculate the final TYPE of a model
    // by checking all the properties!
    // After this we also need to calculate the validation
    // this should all be done in a cleanup / prepare phase, not in this parsing phase

    const result: Model = {
        name,
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        description: getComment(definition.description),
        validation: null,
        extends: [],
        imports: [],
        enum: [],
        properties: [],
    };

    if (definition.$ref) {
        const definitionRef = getType(definition.$ref);
        result.type = definitionRef.type;
        result.base = definitionRef.base;
        result.template = definitionRef.template;
        result.imports.push(...definitionRef.imports);
        result.validation = getValidationForRef(definitionRef);
        return result;
    }

    // If the param is a enum then return the values as an inline type.
    if (definition.enum) {
        const enumerators = getEnum(definition.enum);
        if (enumerators.length) {
            result.type = getEnumType(enumerators);
            result.base = PrimaryType.STRING;
            result.enum.push(...enumerators);
            result.validation = getValidationForEnum(name, enumerators);
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
            result.validation = getValidationForEnum(name, enumerators);
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
            result.validation = getValidationForArrayRef(arrayItems);
        } else {
            const arrayItems = getModel(openApi, definition.items);
            result.type = `${arrayItems.type}[]`;
            result.base = arrayItems.base;
            result.template = arrayItems.template;
            result.imports.push(...arrayItems.imports);
            result.validation = getValidationForArray(name, arrayItems);
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
                            const prop = getType(property.$ref);
                            result.base = PrimaryType.OBJECT;
                            result.imports.push(...prop.imports);
                            result.properties.push({
                                name: propertyName,
                                type: prop.type,
                                base: prop.base,
                                template: prop.template,
                                readOnly: propertyReadOnly,
                                required: propertyRequired,
                                nullable: false,
                                description: property.description || null,
                                validation: getValidationForRef(prop),
                            });
                        } else {
                            const prop = getModel(openApi, property);
                            result.base = PrimaryType.OBJECT;
                            result.imports.push(...prop.imports);
                            result.properties.push({
                                name: propertyName,
                                type: prop.type,
                                base: prop.base,
                                template: prop.template,
                                readOnly: propertyReadOnly,
                                required: propertyRequired,
                                nullable: false,
                                description: property.description || null,
                                validation: prop.validation,
                            });
                        }
                    }
                }
            }
        });
        result.type = getTypeFromProperties(result.properties);
        result.base = PrimaryType.OBJECT;
        result.validation = getValidationForProperties(name, result.properties, result.extends);
    }

    if (definition.type === 'object' && definition.properties) {
        for (const propertyName in definition.properties) {
            if (definition.properties.hasOwnProperty(propertyName)) {
                const property = definition.properties[propertyName];
                const propertyRequired = !!(definition.required && definition.required.includes(propertyName));
                const propertyReadOnly = !!property.readOnly;
                if (property.$ref) {
                    const prop = getType(property.$ref);
                    result.base = PrimaryType.OBJECT;
                    result.imports.push(...prop.imports);
                    result.properties.push({
                        name: propertyName,
                        type: prop.type,
                        base: prop.base,
                        template: prop.template,
                        readOnly: propertyReadOnly,
                        required: propertyRequired,
                        nullable: false,
                        description: property.description || null,
                        validation: getValidationForRef(prop),
                    });
                } else {
                    const prop = getModel(openApi, property);
                    result.base = PrimaryType.OBJECT;
                    result.imports.push(...prop.imports);
                    result.properties.push({
                        name: propertyName,
                        type: prop.type,
                        base: prop.base,
                        template: prop.template,
                        readOnly: propertyReadOnly,
                        required: propertyRequired,
                        nullable: false,
                        description: property.description || null,
                        validation: prop.validation,
                    });
                }
            }
        }
        result.type = getTypeFromProperties(result.properties);
        result.base = PrimaryType.OBJECT;
        result.validation = getValidationForProperties(name, result.properties, result.extends);
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
            result.imports.push('Dictionary');
            console.log(name, 'Dictionary', result.type);
        } else {
            const additionalProperties = getModel(openApi, definition.additionalProperties);
            result.type = `Dictionary<${additionalProperties.type}>`;
            result.base = 'Dictionary';
            result.template = additionalProperties.type;
            result.imports.push(...additionalProperties.imports);
            result.imports.push('Dictionary');
            console.log(name, 'Dictionary', result.type);
        }
        return result;
    }

    // If the schema has a type than it can be a basic or generic type.
    if (definition.type !== 'object' && definition.type) {
        const definitionType = getType(definition.type);
        result.type = definitionType.type;
        result.base = definitionType.base;
        result.template = definitionType.template;
        result.imports.push(...definitionType.imports);
        result.validation = getValidationForType(definitionType);
        return result;
    }

    return result;
}
