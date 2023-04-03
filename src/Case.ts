import { Model } from './client/interfaces/Model';

export enum Case {
    NONE = 'none',
    CAMEL = 'camel',
    SNAKE = 'snake',
}
// Convert a string from snake case or pascal case to camel case.
const toCamelCase = (str: string): string => {
    return str.replace(/_([a-z])/g, match => match[1].toUpperCase());
};

// Convert a string from camel case or pascal case to snake case.
const toSnakeCase = (str: string): string => {
    return str.replace(/([A-Z])/g, match => `_${match.toLowerCase()}`);
};

const transforms = {
    [Case.CAMEL]: toCamelCase,
    [Case.SNAKE]: toSnakeCase,
};

// A recursive function that looks at the models and their properties and
// converts each property name using the provided transform function.
export const convertModelNames = (model: Model, type: Exclude<Case, Case.NONE>): Model => {
    if (!model.properties.length) {
        return {
            ...model,
            name: transforms[type](model.name),
        };
    }
    return {
        ...model,
        properties: model.properties.map(property => {
            return convertModelNames(property, type);
        }),
    };
};
