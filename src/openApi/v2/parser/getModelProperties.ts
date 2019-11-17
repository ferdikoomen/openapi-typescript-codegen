import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getComment } from './getComment';
import { getType } from './getType';
import { Model } from '../../../client/interfaces/Model';
import { OpenApiReference } from '../interfaces/OpenApiReference';
import { getModel } from './getModel';

export function getModelProperties(openApi: OpenApi, definition: OpenApiSchema & OpenApiReference): Model[] {
    const result: Model[] = [];
    for (const propertyName in definition.properties) {
        if (definition.properties.hasOwnProperty(propertyName)) {
            const property = definition.properties[propertyName];
            const propertyRequired = definition.required && definition.required.includes(propertyName);
            const propertyReadOnly = property.readOnly;
            if (property.$ref) {
                const prop = getType(property.$ref);
                result.push({
                    name: propertyName,
                    type: prop.type,
                    base: prop.base,
                    template: prop.template,
                    description: getComment(definition.description),
                    readOnly: propertyReadOnly,
                    required: propertyRequired,
                    imports: prop.imports,
                    extends: [],
                    enum: [],
                    properties: [],
                    validation: {
                        type: 'property',
                        childType: prop.type,
                        childBase: prop.base,
                    },
                });
            } else {
                const prop = getModel(openApi, property);
                result.push({
                    name: propertyName,
                    type: prop.type,
                    base: prop.base,
                    template: prop.template,
                    description: property.description,
                    readOnly: propertyReadOnly,
                    required: propertyRequired,
                    imports: prop.imports,
                    extends: prop.extends,
                    enum: prop.enum,
                    properties: prop.properties,
                    validation: {
                        type: 'property',
                        childType: prop.type,
                        childBase: prop.base,
                        childValidation: prop.validation,
                    },
                });
            }
        }
    }

    return result;
}
