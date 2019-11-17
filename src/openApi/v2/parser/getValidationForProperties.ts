import { EOL } from 'os';
import { ModelProperty } from '../../../client/interfaces/ModelProperty';

export function getValidationForProperties(name: string, properties: ModelProperty[], extendClasses: string[]): string {
    return [
        ...extendClasses.map(extendClass => `${extendClass}.schema.concat(`),
        `yup.object${name ? `<${name}>` : ''}().shape({`,
        ...properties.map(property => {
            let validation = '';
            validation = `${validation}${property.name}: yup.lazy(() => ${property.validation}.default(undefined))`;
            validation = `${validation}${property.required ? '.required()' : ''}`;
            validation = `${validation}${property.nullable ? '.nullable()' : ''}`;
            return `${validation},`;
        }),
        `}).noUnknown()`,
        ...extendClasses.map(() => `)`),
    ].join(EOL);
}
