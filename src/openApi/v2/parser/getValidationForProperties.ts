import { EOL } from 'os';
import { Model } from '../../../client/interfaces/Model';

export function getValidationForProperties(name: string, model: Model): string {
    return [
        ...model.extends.map(extend => `${extend}.schema.concat(`),
        `yup.object${name ? `<${name}>` : ''}().shape({`,
        ...model.properties.map(property => {
            let validation = '';
            validation = `${validation}${property.name}: yup.lazy(() => ${property.validation}.default(undefined))`;
            validation = `${validation}${property.required ? '.required()' : ''}`;
            validation = `${validation}${property.nullable ? '.nullable()' : ''}`;
            return `${validation},`;
        }),
        `}).noUnknown()`,
        ...model.extends.map(() => `)`),
    ].join(EOL);
}
