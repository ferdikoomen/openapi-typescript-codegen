import { ApiProperty } from '@nestjs/swagger';

export class ModelWithBoolean {
    @ApiProperty()
    public readonly prop?: boolean;
}
