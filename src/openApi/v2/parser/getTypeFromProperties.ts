import { EOL } from 'os';
import { ModelProperty } from '../../../client/interfaces/ModelProperty';

export function getTypeFromProperties(properties: ModelProperty[]): string {
    return [
        `{`,
        ...properties.map(property => {
            let type = '';
            type = `${type}${property.readOnly ? 'readonly ' : ''}`;
            type = `${type}${property.name}`;
            type = `${type}${property.required ? '' : '?'}`;
            type = `${type}: ${property.type}`;
            type = `${type}${property.nullable ? ' | null' : ''}`;
            return `${type},`;
        }),
        `}`,
    ].join(EOL);
}
