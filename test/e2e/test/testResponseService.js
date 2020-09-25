import { ResponseService } from './api';

export async function callWithResponse() {
    return await ResponseService.callWithResponse();
}

export async function callWithResponses() {
    return await ResponseService.callWithResponses();
}

export async function callWithDuplicateResponses() {
    return await ResponseService.callWithDuplicateResponses();
}
