import type { Enum } from '../client/interfaces/Enum';
import type { Model } from '../client/interfaces/Model';
import { postProcessModelEnums } from './postProcessModelEnums';

const createEnum = (name: string, value: string): Enum => ({
    name,
    value,
    type: 'string',
    description: null,
});

const createEnumModel = (name: string, enumValues: Enum[]): Model => ({
    name,
    export: 'enum',
    type: 'string',
    base: 'string',
    template: null,
    link: null,
    description: null,
    isDefinition: false,
    isReadOnly: false,
    isNullable: false,
    isRequired: false,
    imports: [],
    enum: enumValues,
    enums: [],
    properties: [],
});

describe('postProcessModelEnums', () => {
    it('merges enum values for duplicate nested enum names', () => {
        const gameKind = createEnumModel('kind', [createEnum('GAME', "'game'")]);
        const model = createEnumModel('FollowTarget', []);
        model.enums = [gameKind, createEnumModel('kind', [createEnum('EVENT', "'event'")]), gameKind];

        expect(postProcessModelEnums(model)).toEqual([
            createEnumModel('kind', [createEnum('GAME', "'game'"), createEnum('EVENT', "'event'")]),
        ]);
        expect(gameKind.enum).toEqual([createEnum('GAME', "'game'")]);
    });
});
