import { ApiProperty } from '@nestjs/swagger';

export class ModelWithInteger {
    @ApiProperty()
    public readonly prop?: number;
}
