import { TypesService } from './api';

export async function types() {
    return await TypesService.types(
        ['foo', 'bar'],
        { foo: 'bar' },
        'Success',
        123,
        'Hello World!',
        true,
        { foo: 'bar' }
    );
}
