import { ApiProperty } from '@nestjs/swagger';

import { ModelWithString } from './ModelWithString';

export class ModelThatExtends extends ModelWithString {
    @ApiProperty()
    public readonly propertyA?: string;

    @ApiProperty()
    public readonly propertyB?: ModelWithString;
}
