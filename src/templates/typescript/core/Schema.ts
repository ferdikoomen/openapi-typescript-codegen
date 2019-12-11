/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

export type FieldSchema = {
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

export type Schema<T> = FieldSchema & {
    readonly item?: string | Schema<T> | FieldSchema;
} & {
    readonly [K in keyof T]: Schema<T[K]> | FieldSchema;
}
