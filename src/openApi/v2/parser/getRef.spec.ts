import { getRef } from './getRef';

describe('getRef', () => {
    it('should produce correct result', () => {
        expect(
            getRef(
                {
                    swagger: '2.0',
                    info: {
                        title: 'dummy',
                        version: '1.0',
                    },
                    host: 'localhost:8080',
                    basePath: '/api',
                    schemes: ['http', 'https'],
                    paths: {},
                    definitions: {
                        Example: {
                            title: 'Example model',
                            description: 'This is an Example model ',
                            type: 'integer',
                        },
                    },
                },
                {
                    $ref: '#/definitions/Example',
                }
            )
        ).toEqual({
            title: 'Example model',
            description: 'This is an Example model ',
            type: 'integer',
        });
    });
});
