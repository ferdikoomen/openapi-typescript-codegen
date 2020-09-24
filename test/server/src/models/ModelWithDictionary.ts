import { ApiProperty } from '@nestjs/swagger';

export class ModelWithDictionary {
    @ApiProperty()
    public readonly prop?: Record<string, string>;
}
