import { DefaultsService } from './api';

export async function callWithDefaultParameters() {
    return await DefaultsService.callWithDefaultParameters();
}

export async function callWithDefaultOptionalParameters() {
    return await DefaultsService.callWithDefaultOptionalParameters();
}

export async function callToTestOrderOfParams() {
    return await DefaultsService.callToTestOrderOfParams(
        'parameterStringWithNoDefault',
        'parameterOptionalStringWithDefault',
        'parameterOptionalStringWithEmptyDefault',
        'parameterOptionalStringWithNoDefault',
        'parameterStringWithDefault',
        'parameterStringWithEmptyDefault'
    );
}
