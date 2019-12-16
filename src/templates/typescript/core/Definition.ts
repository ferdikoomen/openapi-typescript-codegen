/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

import { Dictionary } from '../models/Dictionary';

export type FieldDefinition = {
    readonly type?: string;
    readonly isReadOnly?: boolean;
    readonly isRequired?: boolean;
    readonly isNullable?: boolean;
    readonly format?: string;
    readonly maximum?: number;
    readonly exclusiveMaximum?: boolean;
    readonly minimum?: number;
    readonly exclusiveMinimum?: boolean;
    readonly multipleOf?: number;
    readonly maxLength?: number;
    readonly minLength?: number;
    readonly pattern?: string;
    readonly maxItems?: number;
    readonly minItems?: number;
    readonly uniqueItems?: boolean;
    readonly maxProperties?: number;
    readonly minProperties?: number;
}

type ArrayDefinition<T> = FieldDefinition & {
    readonly item: Definition<T>;
}

type DictionaryDefinition<T> = FieldDefinition & {
    readonly item: Definition<T>;
}

type ObjectDefinition<T> = FieldDefinition & {
        readonly [K in keyof T]: Definition<T[K]>;
    }

export type Definition<T> =
    T extends string ? FieldDefinition :
    T extends number ? FieldDefinition :
    T extends boolean ? FieldDefinition :
    T extends File ? FieldDefinition :
    T extends Blob ? FieldDefinition :
    T extends Array<infer U> ? ArrayDefinition<U> :
    T extends Dictionary<infer U> ? DictionaryDefinition<U> :
    T extends Object ? ObjectDefinition<T> :
    FieldDefinition
