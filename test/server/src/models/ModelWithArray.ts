import { ApiProperty } from '@nestjs/swagger';

export class ModelWithArray {
    @ApiProperty()
    public readonly prop?: string[];
}
