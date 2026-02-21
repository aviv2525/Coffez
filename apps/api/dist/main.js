"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, '../.env') });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cookie_parser_1 = require("cookie-parser");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    app.use((0, cookie_parser_1.default)());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const corsOrigin = config.get('CORS_ORIGIN', 'http://localhost:3000');
    app.enableCors({
        origin: corsOrigin.split(',').map((o) => o.trim()),
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    try {
        const swagger = new swagger_1.DocumentBuilder()
            .setTitle('OrderBridge API')
            .setDescription('Marketplace API for sellers and orders')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swagger);
        swagger_1.SwaggerModule.setup('swagger', app, document);
    }
    catch (e) {
        console.warn('Swagger setup skipped:', e.message);
    }
    const basePort = Number(config.get('PORT', 4000)) || 4000;
    const maxAttempts = 20;
    let port = basePort;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        port = basePort + attempt;
        try {
            await app.listen(port);
            console.log(`API running on http://localhost:${port}, Swagger: http://localhost:${port}/swagger`);
            return;
        }
        catch (e) {
            if (e?.code === 'EADDRINUSE' && attempt < maxAttempts - 1)
                continue;
            throw e;
        }
    }
}
bootstrap().catch(console.error);
//# sourceMappingURL=main.js.map