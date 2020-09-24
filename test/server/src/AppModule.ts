import { Module } from '@nestjs/common';

import { DefaultsController } from './controllers/DefaultsController';
import { ParametersController } from './controllers/ParametersController';
import { ResponseController } from './controllers/ResponseController';
import { SimpleController } from './controllers/SimpleController';

@Module({
    controllers: [SimpleController, ParametersController, DefaultsController, ResponseController],
})
export class AppModule {
    //
}
