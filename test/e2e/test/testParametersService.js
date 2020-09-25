import { ParametersService } from './api';

export async function callWithParameters() {
    return await ParametersService.callWithParameters(
        'parameterHeader',
        'parameterQuery',
        'parameterForm',
        'parameterBody',
        'parameterPath'
    );
}

export async function callWithWeirdParameterNames() {
    return await ParametersService.callWithWeirdParameterNames(
        'parameterHeader',
        'parameterQuery',
        'parameterForm',
        'parameterBody',
        'parameterPath1',
        'parameterPath2',
        'parameterPath3'
    );
}
