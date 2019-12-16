/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

import { Dictionary } from "../models/Dictionary";

type FieldSchema = {
    readonly type?: string;
    readonly isReadOnly?: boolean;
    readonly isRequired?: boolean;
    readonly isNullable?: boolean;
    readonly format?: 'int32' | 'int64' | 'float' | 'double' | 'string' | 'boolean' | 'byte' | 'binary' | 'date' | 'date-time' | 'password';
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

type ArraySchema<T> = FieldSchema & {
    readonly item: Schema<T>;
}

type DictionarySchema<T> = FieldSchema & {
    readonly item: Schema<T>;
}

type ObjectSchema<T> = FieldSchema & {
    readonly [K in keyof T]: Schema<T[K]>;
}

export type Schema<T> =
    T extends string ? FieldSchema :
    T extends number ? FieldSchema :
    T extends boolean ? FieldSchema :
    T extends File ? FieldSchema :
    T extends Blob ? FieldSchema :
    T extends Array<infer U> ? ArraySchema<U> :
    T extends Dictionary<infer U> ? DictionarySchema<U> :
    T extends Object ? ObjectSchema<T> :
    FieldSchema
