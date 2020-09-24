import { ApiProperty } from '@nestjs/swagger';

import { ModelThatExtends } from './ModelThatExtends';
import { ModelWithString } from './ModelWithString';

export class ModelThatExtendsExtends extends ModelThatExtends {
    @ApiProperty()
    public readonly propertyC?: string;

    @ApiProperty()
    public readonly propertyD?: ModelWithString;
}
