import { ApiProperty } from '@nestjs/swagger';

export class ModelThatExtends {
    @ApiProperty()
    prop?: number;
}
