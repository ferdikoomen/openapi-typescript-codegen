import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {AppModule} from './AppModule';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    const options = new DocumentBuilder()
        .setTitle('OpenAPI')
        .setDescription('The OpenAPI description')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('api', app, document);

    await app.listen(3000);
}

bootstrap();
