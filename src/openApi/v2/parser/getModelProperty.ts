import { ModelProperty } from '../../../client/interfaces/ModelProperty';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { OpenApiReference } from '../interfaces/OpenApiReference';
import { getType } from './getType';

export function getModelProperty(name: string, schema: OpenApiSchema & OpenApiReference): ModelProperty {
    /**
     $ref?: string;
     format?: 'int32' | 'int64' | 'float' | 'double' | 'string' | 'boolean' | 'byte' | 'binary' | 'date' | 'date-time' | 'password';
     title?: string;
     description?: string;
     default?: any;
     multipleOf?: number;
     maximum?: number;
     exclusiveMaximum?: boolean;
     minimum?: number;
     exclusiveMinimum?: boolean;
     maxLength?: number;
     minLength?: number;
     pattern?: string;
     maxItems?: number;
     minItems?: number;
     uniqueItems?: number;
     maxProperties?: number;
     minProperties?: number;
     required?: string[];
     enum?: string[] | number[];
     type?: string;
     items?: OpenApiReference | OpenApiSchema;
     allOf?: OpenApiReference[] | OpenApiSchema[];
     properties?: Dictionary<OpenApiSchema>;
     additionalProperties?: boolean | OpenApiReference | OpenApiSchema;
     discriminator?: string;
     readOnly?: boolean;
     xml?: OpenApiXml;
     externalDocs?: OpenApiExternalDocs;
     example?: any;
     */

    const prop: ModelProperty = {
        name: name,
        type: '',
        base: '',
        template: '',
        description: schema.description,
        default: schema.default,
        required: false,
        nullable: false,
        readOnly: schema.readOnly || false,
        imports: [],
        extends: [],
        properties: [],
    };

    if (schema.$ref) {
        // console.log('parse $ref?');
    }

    if (schema.properties || schema.type === 'object') {
        prop.type = 'interface';
        // type is interface!?
    }

    if (schema.enum) {
        prop.type = 'enum';
        // type is enum!
    }

    console.log('propertyName:', schema);
    console.log('format:', schema.format);
    console.log('type:', schema.type);

    const properties = schema.properties;
    for (const propertyName in properties) {
        if (properties.hasOwnProperty(propertyName)) {
            const property = properties[propertyName];
            console.log('propertyName', propertyName);
            // getModelProperty(propertyName, property);
        }
    }

    if (schema.allOf) {
        schema.allOf.forEach(parent => {
            if (parent.$ref) {
                const extend = getType(parent.$ref);
                prop.extends.push(extend.type);
                prop.imports.push(extend.base);
            }
            if (parent.properties) {
                console.log(parent.properties);
                // const properties: ParsedModelProperties = parseModelProperties(modelClass, definition.allOf[1].properties as SwaggerDefinitions, required);
                // model.imports.push(...properties.imports);
                // model.properties.push(...properties.properties);
                // model.enums.push(...properties.enums);
            }
        });
    }

    return prop;
}
