import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ModelThatExtends } from '../models/ModelThatExtends';
import { ModelThatExtendsExtends } from '../models/ModelThatExtendsExtends';
import { ModelWithArray } from '../models/ModelWithArray';
import { ModelWithBoolean } from '../models/ModelWithBoolean';
import { ModelWithDictionary } from '../models/ModelWithDictionary';
import { ModelWithInteger } from '../models/ModelWithInteger';
import { ModelWithProperties } from '../models/ModelWithProperties';
import { ModelWithReference } from '../models/ModelWithReference';
import { ModelWithString } from '../models/ModelWithString';

/* eslint-disable @typescript-eslint/no-unused-vars */
@ApiTags('response')
@Controller('response')
export class ResponseController {
    @Get('getString')
    @ApiResponse({ status: 200, type: String })
    public getString(): string {
        return 'Hello World!';
    }

    @Get('getNumber')
    @ApiResponse({ status: 200, type: Number })
    public getNumber(): number {
        return 123;
    }

    @Get('getBoolean')
    @ApiResponse({ status: 200, type: Boolean })
    public getBoolean(): boolean {
        return true;
    }

    @Get('getModelWithString')
    @ApiResponse({ status: 200, type: ModelWithString })
    public getModelWithString(): ModelWithString {
        return {
            prop: 'Hello World!',
        };
    }

    @Get('getModelWithInteger')
    @ApiResponse({ status: 200, type: ModelWithInteger })
    public getModelWithInteger(): ModelWithInteger {
        return {
            prop: 123,
        };
    }

    @Get('getModelWithBoolean')
    @ApiResponse({ status: 200, type: ModelWithBoolean })
    public getModelWithBoolean(): ModelWithBoolean {
        return {
            prop: true,
        };
    }

    @Get('getModelWithArray')
    @ApiResponse({ status: 200, type: ModelWithArray })
    public getModelWithArray(): ModelWithArray {
        return {
            prop: ['foo', 'bar'],
        };
    }

    @Get('getModelWithDictionary')
    @ApiResponse({ status: 200, type: ModelWithDictionary })
    public getModelWithDictionary(): ModelWithDictionary {
        return {
            prop: {
                foo: 'bar',
            },
        };
    }

    @Get('getModelWithReference')
    @ApiResponse({ status: 200, type: ModelWithReference })
    public getModelWithReference(): ModelWithReference {
        return {
            prop: {
                prop: 'Hello World!',
            },
        };
    }

    @Get('getModelWithProperties')
    @ApiResponse({ status: 200, type: ModelWithProperties })
    public getModelWithProperties(): ModelWithProperties {
        return {
            string: 'Hello World!',
            number: 123,
            boolean: true,
            array: ['foo', 'bar'],
            dictionary: {
                foo: 'bar',
            },
        };
    }

    @Get('getModelThatExtends')
    @ApiResponse({ status: 200, type: ModelThatExtends })
    public getModelThatExtends(): ModelThatExtends {
        return {
            prop: 'prop',
            propertyA: 'propertyA',
            propertyB: {
                prop: 'propertyB',
            },
        };
    }

    @Get('getModelThatExtendsExtends')
    @ApiResponse({ status: 200, type: ModelThatExtendsExtends })
    public getModelThatExtendsExtends(): ModelThatExtendsExtends {
        return {
            prop: 'prop',
            propertyA: 'propertyA',
            propertyB: {
                prop: 'propertyB',
            },
            propertyC: 'propertyC',
            propertyD: {
                prop: 'propertyD',
            },
        };
    }
}
