import { getRef } from './getRef';

describe('getRef', () => {
    it('should produce correct result', () => {
        expect(
            getRef(
                {
                    openapi: '3.0',
                    info: {
                        title: 'dummy',
                        version: '1.0',
                    },
                    paths: {},
                    servers: [
                        {
                            url: 'https://localhost:8080/api',
                        },
                    ],
                    components: {
                        schemas: {
                            Example: {
                                description: 'This is an Example model ',
                                type: 'integer',
                            },
                        },
                    },
                },
                {
                    $ref: '#/components/schemas/Example',
                }
            )
        ).toEqual({
            description: 'This is an Example model ',
            type: 'integer',
        });
    });
});
