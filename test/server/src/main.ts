import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './AppModule';

/**
 * This is a simple OpenAPI test server that we use to run e2e tests. You can find
 * more information inside the controllers and models of this server.
 * When you run this server the following urls are available:
 * - Swagger UI: http://localhost:3000/api
 * - Swagger Specification: http://localhost:3000/api-json
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    const options = new DocumentBuilder().setTitle('OpenAPI').setVersion('1.0').build();

    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('api', app, document);

    await app.listen(3000);
}

bootstrap();
