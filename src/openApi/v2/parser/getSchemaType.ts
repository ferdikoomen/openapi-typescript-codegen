import { Schema } from '../../../client/interfaces/Schema';

// string
// array[test]
// array[{
//   foo: string
//   bar: string
// }]

export function getSchemaType(schema: Schema): string {
    // if (schema.properties) {
    //     return schema.type
    // }
    if (schema.type) {
        return schema.type;
    }
    return 'any';
}
