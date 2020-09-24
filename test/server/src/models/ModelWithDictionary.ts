import { ApiProperty } from '@nestjs/swagger';

export class ModelWithDictionary {
    @ApiProperty()
    prop?: number;
}
