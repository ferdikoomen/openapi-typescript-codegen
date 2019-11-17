import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getComment } from './getComment';
import { getType } from './getType';
import { Model } from '../../../client/interfaces/Model';
import { getModel } from './getModel';

export function getModelProperties(openApi: OpenApi, definition: OpenApiSchema): Model[] {
    const result: Model[] = [];
    for (const propertyName in definition.properties) {
        if (definition.properties.hasOwnProperty(propertyName)) {
            const property = definition.properties[propertyName];
            const propertyRequired = !!(definition.required && definition.required.includes(propertyName));
            const propertyReadOnly = !!property.readOnly;
            if (property.$ref) {
                const prop = getType(property.$ref);
                result.push({
                    name: propertyName,
                    type: prop.type,
                    base: prop.base,
                    template: prop.template,
                    link: null,
                    description: getComment(property.description),
                    readOnly: propertyReadOnly,
                    required: propertyRequired,
                    nullable: false,
                    imports: prop.imports,
                    extends: [],
                    enum: [],
                    enums: [],
                    properties: [],
                    validation: {
                        type: 'property',
                        childType: prop.type,
                        childBase: prop.base,
                        childValidation: null,
                    },
                });
            } else {
                const prop = getModel(openApi, property);
                result.push({
                    name: propertyName,
                    type: prop.type,
                    base: prop.base,
                    template: prop.template,
                    link: prop.link,
                    description: getComment(property.description),
                    readOnly: propertyReadOnly,
                    required: propertyRequired,
                    nullable: false,
                    imports: prop.imports,
                    extends: prop.extends,
                    enum: prop.enum,
                    enums: prop.enums,
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
