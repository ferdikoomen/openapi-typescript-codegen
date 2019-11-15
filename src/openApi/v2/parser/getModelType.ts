import { Model } from '../../../client/interfaces/Model';

// string
// array[test]
// array[{
//   foo: string
//   bar: string
// }]
export function getModelType(model: Model): string {
    // if (schema.properties) {
    //     return schema.type
    // }
    if (model.type) {
        return model.type;
    }
    return 'any';
}
