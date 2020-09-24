import { ApiProperty } from '@nestjs/swagger';

export class ModelWithInteger {
    @ApiProperty()
    prop?: number;
}
