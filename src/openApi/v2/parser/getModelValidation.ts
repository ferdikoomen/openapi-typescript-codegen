import { EOL } from 'os';
import { ModelProperty } from '../../../client/interfaces/ModelProperty';

export function getModelValidation(name: string, properties: ModelProperty[]): string {
    return [
        `yup.object().shape({`,
        // ...properties.map(property => {
        //     return `    ${property.name}: ${property.validation},`;
        // }),
        `}).noUnknown()`,
    ].join(EOL);
}
