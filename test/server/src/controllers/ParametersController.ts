import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ModelWithString } from '../models/ModelWithString';

/* eslint-disable @typescript-eslint/no-unused-vars */
@ApiTags('parameters')
@Controller('parameters')
export class ParametersController {
    @Get('callWithParameters')
    public callWithParameters(
        @Param('parameterString') parameterString: string,
        @Param('parameterNumber') parameterNumber: number,
        @Param('parameterBoolean') parameterBoolean: boolean,
        @Param('parameterDictionary') parameterDictionary: Record<string, string>
    ): any {
        return {
            parameterString,
            parameterNumber,
            parameterBoolean,
            parameterDictionary,
        };
    }

    @Get('callWithWeirdParameterNames')
    public callWithWeirdParameterNames(
        @Param('parameter.1') parameter1: string,
        @Param('parameter-2') parameter2: string,
        @Param('parameter_3') parameter3: string,
        @Param('PARAMETER.4') parameter4: string,
        @Param('PARAMETER+5') parameter5: string,
        @Param('PARAMETER&6') parameter6: string
    ): any {
        return {
            parameter1,
            parameter2,
            parameter3,
            parameter4,
            parameter5,
            parameter6,
        };
    }

    @Get('callWithDefaultParameters')
    @ApiResponse({
        status: 200,
        type: ModelWithString,
    })
    public callWithDefaultParameters(
        @Param('parameterNumberWithDefault') parameterNumberWithDefault: number = 123,
        @Param('parameterBooleanWithDefault') parameterBooleanWithDefault: boolean = true,
        @Param('parameterStringWithDefault') parameterStringWithDefault: string = 'Hello World!'
    ): any {
        return {
            parameterNumberWithDefault,
            parameterBooleanWithDefault,
            parameterStringWithDefault,
        };
    }

    @Get('getCallWithBody')
    @ApiResponse({
        status: 200,
        type: ModelWithString,
    })
    public getCallWithBody(@Body() body: ModelWithString): ModelWithString {
        return body;
    }

    @Post('postCallWithBody')
    @ApiResponse({
        status: 200,
        type: ModelWithString,
    })
    public postCallWithBody(@Body() body: ModelWithString): ModelWithString {
        return body;
    }
}
