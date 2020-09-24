import { ApiProperty } from '@nestjs/swagger';

export class ModelWithProperties {
    @ApiProperty()
    public readonly number?: number;

    @ApiProperty()
    public readonly string?: string;

    @ApiProperty()
    public readonly boolean?: boolean;

    @ApiProperty()
    public readonly array?: string[];

    @ApiProperty()
    public readonly dictionary?: Record<string, string>;
}
