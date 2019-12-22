/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

export type FieldSchema = {
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

export type ObjectSchema<T> = FieldSchema & {
    properties?: {
        readonly [K in keyof T]: Schema<T[K]>;
    }
}

export type Schema<T> =
    T extends string ? FieldSchema :
    T extends number ? FieldSchema :
    T extends boolean ? FieldSchema :
    T extends File ? FieldSchema :
    T extends Blob ? FieldSchema :
    T extends Object ? ObjectSchema<T> :
    FieldSchema
