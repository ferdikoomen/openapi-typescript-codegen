import {OpenApi} from '../interfaces/OpenApi';
import {OpenApiSchema} from '../interfaces/OpenApiSchema';
import {getComment} from './getComment';
import {getType} from './getType';
import {Model} from '../../../client/interfaces/Model';
import {PrimaryType} from './constants';
import {getEnumType} from './getEnumType';
import {ModelProperty} from '../../../client/interfaces/ModelProperty';
import {getEnum} from './getEnum';
import {getEnumFromDescription} from './getEnumFromDescription';

export function getModel(openApi: OpenApi, definition: OpenApiSchema, name: string = 'unknown'): Model {

    // TODO: Properties now contain ALL properties, so we need to filter out enums
    // before we render the file, plus we need to calculate the final TYPE of a model
    // by checking all the properties!
    // After this we also need to calculate the validation
    // this should all be done in a cleanup / prepare phase, not in this parsing phase

    const result: Model = {
        name,
        type: 'any',
        base: 'any',
        template: null,
        description: getComment(definition.description),
        extends: [],
        imports: [],
        enum: [],
        properties: new Map<string, ModelProperty>(),
    };

    if (definition.$ref) {
        const definitionRef = getType(definition.$ref);
        result.type = definitionRef.type;
        result.base = definitionRef.base;
        result.template = definitionRef.template;
        result.imports.push(...definitionRef.imports);
        return result;
    }

    // If the param is a enum then return the values as an inline type.
    if (definition.enum) {
        const enumerators = getEnum(definition.enum);
        if (enumerators.length) {
            result.type = getEnumType(enumerators);
            result.base = PrimaryType.STRING;
            result.enum.push(...enumerators);
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
            return result;
        }
        return result;
    }

    // If the schema is an Array type, we check for the child type,
    // so we can create a typed array, otherwise this will be a "any[]".
    if (definition.type === 'array' && definition.items) {
        if (definition.items.$ref) {
            const arrayItemsRef = getType(definition.items.$ref);
            result.type = `${arrayItemsRef.type}[]`;
            result.base = arrayItemsRef.base;
            result.template = arrayItemsRef.template;
            result.imports.push(...arrayItemsRef.imports);
        } else {
            const arrayItemsModel = getModel(openApi, definition.items);
            result.type = `${arrayItemsModel.type}[]`;
            result.base = arrayItemsModel.base;
            result.template = arrayItemsModel.template;
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
                            result.base = PrimaryType.OBJECT;
                            result.imports.push(...propertyRef.imports);
                            result.properties.set(propertyName, {
                                name: propertyName,
                                type: propertyRef.type,
                                base: propertyRef.base,
                                template: propertyRef.template,
                                readOnly: propertyReadOnly,
                                required: propertyRequired,
                                nullable: false,
                                description: property.description || null,
                            });
                        } else {
                            const propertyModel = getModel(openApi, property);
                            result.base = PrimaryType.OBJECT;
                            result.imports.push(...propertyModel.imports);
                            result.properties.set(propertyName, {
                                name: propertyName,
                                type: propertyModel.type,
                                base: propertyModel.base,
                                template: propertyModel.template,
                                readOnly: propertyReadOnly,
                                required: propertyRequired,
                                nullable: false,
                                description: property.description || null,
                            });
                        }
                    }
                }
            }
        });
    }

    if (definition.type === 'object' && definition.properties) {
        for (const propertyName in definition.properties) {
            if (definition.properties.hasOwnProperty(propertyName)) {
                const property = definition.properties[propertyName];
                const propertyRequired = !!(definition.required && definition.required.includes(propertyName));
                const propertyReadOnly = !!property.readOnly;
                if (property.$ref) {
                    const propertyRef = getType(property.$ref);
                    result.base = PrimaryType.OBJECT;
                    result.imports.push(...propertyRef.imports);
                    result.properties.set(propertyName, {
                        name: propertyName,
                        type: propertyRef.type,
                        base: propertyRef.base,
                        template: propertyRef.template,
                        readOnly: propertyReadOnly,
                        required: propertyRequired,
                        nullable: false,
                        description: property.description || null,
                    });
                } else {
                    const propertyModel = getModel(openApi, property);
                    result.base = PrimaryType.OBJECT;
                    result.imports.push(...propertyModel.imports);
                    result.properties.set(propertyName, {
                        name: propertyName,
                        type: propertyModel.type,
                        base: propertyModel.base,
                        template: propertyModel.template,
                        readOnly: propertyReadOnly,
                        required: propertyRequired,
                        nullable: false,
                        description: property.description || null,
                    });
                }
            }
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
        return result;
    }

    return result;
}
