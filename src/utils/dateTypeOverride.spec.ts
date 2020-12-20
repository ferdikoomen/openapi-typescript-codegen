import { dateTypeOverride, RequiredFields } from './dateTypeOverride';

describe('dateTypeOverride', () => {
    it('should replace the base type for the model combination {base: "string", format: "data-time"}', async () => {
        const expected = JSON.parse(JSON.stringify(models)) as RequiredFields<ModelOnlyName>[];
        expected[1].properties[1].base = 'Date';
        if (expected[3].link?.properties[0].base) {
            expected[3].link.properties[0].base = 'Date';
        }

        const result = dateTypeOverride(models);
        expect(result).toEqual(expected);
    });
});

type ModelOnlyName = { name: string };

const baseModel: Omit<RequiredFields<ModelOnlyName>, 'export' | 'base' | 'name'> = {
    link: null,
    properties: [],
};

const models: RequiredFields<ModelOnlyName>[] = [
    {
        ...baseModel,
        name: 'ParentType',
        export: 'interface',
        base: 'any',
        properties: [
            {
                ...baseModel,
                name: 'name',
                export: 'interface',
                base: 'any',
            },
        ],
    },
    {
        ...baseModel,
        name: 'ExampleType',
        export: 'interface',
        base: 'any',
        properties: [
            {
                ...baseModel,
                name: 'id',
                export: 'generic',
                base: 'number',
            },
            {
                ...baseModel,
                name: 'dateTime',
                export: 'generic',
                base: 'string',
                format: 'date-time',
            },
            {
                ...baseModel,
                name: 'date',
                export: 'generic',
                base: 'string',
                format: 'date',
            },
            {
                ...baseModel,
                name: 'dateTimeNullable',
                export: 'generic',
                base: 'string',
                format: 'date',
            },
            {
                ...baseModel,
                name: 'dateNullable',
                export: 'generic',
                base: 'string',
                format: 'date',
            },
        ],
    },
    {
        ...baseModel,
        name: 'InheritType',
        export: 'all-of',
        base: 'any',
        properties: [
            {
                ...baseModel,
                name: '',
                export: 'reference',
                base: 'ParentType',
            },
            {
                ...baseModel,
                name: '',
                export: 'reference',
                base: 'ExampleType',
            },
        ],
    },
    {
        ...baseModel,
        name: 'WrappedInArray',
        export: 'array',
        base: 'any',
        link: {
            ...baseModel,
            name: '',
            export: 'interface',
            base: 'any',
            properties: [
                {
                    ...baseModel,
                    name: 'dateTime',
                    export: 'generic',
                    base: 'string',
                    format: 'date-time',
                },
                {
                    ...baseModel,
                    name: 'date',
                    export: 'generic',
                    base: 'string',
                    format: 'date',
                },
                {
                    ...baseModel,
                    name: 'dateTimeNullable',
                    export: 'generic',
                    base: 'string',
                    format: 'date',
                },
                {
                    ...baseModel,
                    name: 'dateNullable',
                    export: 'generic',
                    base: 'string',
                    format: 'date',
                },
            ],
        },
    },
];
