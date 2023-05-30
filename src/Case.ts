import { Enum } from './client/interfaces/Enum';
import { Model } from './client/interfaces/Model';
import { OperationResponse } from './client/interfaces/OperationResponse';
import { Service } from './client/interfaces/Service';

export enum Case {
    NONE = 'none',
    CAMEL = 'camel',
    SNAKE = 'snake',
}
// Convert a string from snake case to camel case.
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
export const convertModelNames = <T extends Model | OperationResponse>(model: T, type: Exclude<Case, Case.NONE>): T => {
    return {
        ...model,
        name: transforms[type](model.name),
        link: model.link ? convertModelNames(model.link, type) : null,
        enum: model.enum.map(modelEnum => convertEnumName(modelEnum, type)),
        enums: model.enums.map(property => convertModelNames(property, type)),
        properties: model.properties.map(property => convertModelNames(property, type)),
    };
};

const convertEnumName = (modelEnum: Enum, type: Exclude<Case, Case.NONE>): Enum => {
    return {
        ...modelEnum,
        name: transforms[type](modelEnum.name),
    };
};

export const convertServiceCase = (service: Service, type: Exclude<Case, Case.NONE>): Service => {
    return {
        ...service,
        operations: service.operations.map(op => ({
            ...op,
            results: op.results.map(results => convertModelNames(results, type)),
        })),
    };
};
