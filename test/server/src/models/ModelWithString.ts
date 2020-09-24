import { ApiProperty } from '@nestjs/swagger';

export class ModelWithString {
    @ApiProperty()
    public readonly prop?: string;
}
