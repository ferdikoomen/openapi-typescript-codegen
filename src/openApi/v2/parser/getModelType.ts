import { EOL } from 'os';
import { ModelProperty } from '../../../client/interfaces/ModelProperty';

export function getModelType(properties: ModelProperty[]): string {
    return [
        `{`,
        ...properties.map(property => {
            return `    ${property.readOnly ? 'readonly ' : ''}${property.name}${property.required ? '' : '?'}: ${property.type},`;
        }),
        `}`,
    ].join(EOL);
}
