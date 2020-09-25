/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { ComplexService, DefaultsService } from './api';

export async function testDefaultsService(): Promise<any> {
    const callWithDefaultParameters = await DefaultsService.callWithDefaultParameters();
    const callWithDefaultOptionalParameters = await DefaultsService.callWithDefaultOptionalParameters();
    return {
        callWithDefaultParameters,
        callWithDefaultOptionalParameters,
    };
}

export async function testComplexService(): Promise<any> {
    const complexTypes = await ComplexService.complexTypes(
        {},
        {
            prop: 'Hello World!',
        }
    );
    return {
        complexTypes,
    };
}
