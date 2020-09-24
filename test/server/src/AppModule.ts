import { Module } from '@nestjs/common';

import { ParametersController } from './controllers/ParametersController';
import { ResponseController } from './controllers/ResponseController';
import { SimpleController } from './controllers/SimpleController';

@Module({
    controllers: [SimpleController, ParametersController, ResponseController],
})
export class AppModule {
    //
}
