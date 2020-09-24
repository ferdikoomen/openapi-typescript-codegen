import { ApiProperty } from '@nestjs/swagger';

import { ModelWithString } from './ModelWithString';

export class ModelWithReference {
    @ApiProperty()
    public readonly prop?: ModelWithString;
}
