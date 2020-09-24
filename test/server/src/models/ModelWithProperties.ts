import { ApiProperty } from '@nestjs/swagger';

export class ModelWithProperties {
    @ApiProperty()
    prop?: number;
}
