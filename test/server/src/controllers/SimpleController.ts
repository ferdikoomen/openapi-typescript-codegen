import { Controller, Delete, Get, Head, Options, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/* eslint-disable @typescript-eslint/no-unused-vars */
@ApiTags('simple')
@Controller('simple')
export class SimpleController {
    @Get('getCallWithoutParametersAndResponse')
    public getCallWithoutParametersAndResponse(): void {
        //
    }

    @Put('putCallWithoutParametersAndResponse')
    public putCallWithoutParametersAndResponse(): void {
        //
    }

    @Post('postCallWithoutParametersAndResponse')
    public postCallWithoutParametersAndResponse(): void {
        //
    }

    @Delete('deleteCallWithoutParametersAndResponse')
    public deleteCallWithoutParametersAndResponse(): void {
        //
    }

    @Options('optionsCallWithoutParametersAndResponse')
    public optionsCallWithoutParametersAndResponse(): void {
        //
    }

    @Head('headCallWithoutParametersAndResponse')
    public headCallWithoutParametersAndResponse(): void {
        //
    }

    @Patch('patchCallWithoutParametersAndResponse')
    public patchCallWithoutParametersAndResponse(): void {
        //
    }
}
