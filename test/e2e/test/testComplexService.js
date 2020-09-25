import { ComplexService } from './api';

export async function complexTypes() {
    return await ComplexService.complexTypes({
        first: {
            second: {
                third: 'Hello World!',
            },
        },
    }, {
        prop: 'Hello World!',
    });
}
