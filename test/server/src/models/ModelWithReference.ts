import { ApiProperty } from '@nestjs/swagger';

export class ModelWithReference {
    @ApiProperty()
    prop?: number;
}
