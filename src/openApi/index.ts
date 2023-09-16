import { OpenApi as OpenApiV2 } from '../openApi/v2/interfaces/OpenApi.js';
import { OpenApi as OpenApiV3 } from '../openApi/v3/interfaces/OpenApi.js';

export type AnyOpenApi = OpenApiV2 | OpenApiV3;
