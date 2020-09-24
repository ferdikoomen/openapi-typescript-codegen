import { ApiProperty } from '@nestjs/swagger';

export class ModelWithString {
    @ApiProperty()
    prop?: string;
}
