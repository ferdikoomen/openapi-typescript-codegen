#!/bin/sh

swagger-codegen generate --input-spec v2/spec.json --lang java --output examples/v2/java/
swagger-codegen generate --input-spec v2/spec.json --lang typescript-angular --output examples/v2/typescript-angular/
swagger-codegen generate --input-spec v2/spec.json --lang javascript --output examples/v2/javascript/

swagger-codegen generate --input-spec v3/spec.json --lang java --output examples/v3/java/
swagger-codegen generate --input-spec v3/spec.json --lang typescript-angular --output examples/v3/typescript-angular/
swagger-codegen generate --input-spec v3/spec.json --lang javascript --output examples/v3/javascript/
