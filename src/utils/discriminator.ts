import { Model } from '../client/interfaces/Model';
import { OpenApi } from '../openApi/v3/interfaces/OpenApi';
import { OpenApiDiscriminator } from '../openApi/v3/interfaces/OpenApiDiscriminator';
import { stripNamespace } from '../openApi/v3/parser/stripNamespace';
import { Dictionary } from './types';

const inverseDictionary = (mapObj: Dictionary<string>) => {
    const m2: Dictionary<string> = {};
    for (const key in mapObj) {
        m2[mapObj[key]] = key;
    }
    return m2;
};

export function findOneOfParentDiscriminator(openApi: OpenApi, parent?: Model): OpenApiDiscriminator | undefined {
    if (openApi.components && parent) {
        for (const definitionName in openApi.components.schemas) {
            if (openApi.components.schemas.hasOwnProperty(definitionName)) {
                const schema = openApi.components.schemas[definitionName];
                if (schema.discriminator && schema.oneOf?.length && schema.oneOf.some(definition => definition.$ref && stripNamespace(definition.$ref) == parent.name)) {
                    return schema.discriminator;
                }
            }
        }
    }
    return undefined;
}

export function mapPropertyValue(discriminator: OpenApiDiscriminator, parent: Model): string {
    if (discriminator.mapping) {
        const mapping = inverseDictionary(discriminator.mapping);
        const key = Object.keys(mapping).find(item => stripNamespace(item) == parent.name);
        if (key && mapping[key]) {
            return mapping[key];
        }
    }
    return parent.name;
}
