import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ModelWithString } from '../models/ModelWithString';

/* eslint-disable @typescript-eslint/no-unused-vars */
@ApiTags('response')
@Controller('response')
export class ResponseController {
    @Get('monkey')
    @ApiResponse({
        status: 200,
        type: ModelWithString,
    })
    monkey(@Param('id') id: string): ModelWithString {
        return {
            prop: 'Hello World!',
        };
    }
}
