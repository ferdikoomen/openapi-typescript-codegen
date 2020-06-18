#!/bin/sh

curl https://repo1.maven.org/maven2/io/swagger/swagger-codegen-cli/2.4.14/swagger-codegen-cli-2.4.14.jar -o swagger-codegen-cli-v2.jar
curl https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.20/swagger-codegen-cli-3.0.20.jar -o swagger-codegen-cli-v3.jar

java -jar ./swagger-codegen-cli-v2.jar generate -i v2/spec.json -l typescript-aurelia -o examples/v2/typescript-aurelia/
java -jar ./swagger-codegen-cli-v2.jar generate -i v2/spec.json -l typescript-angular -o examples/v2/typescript-angular/
java -jar ./swagger-codegen-cli-v2.jar generate -i v2/spec.json -l typescript-inversify -o examples/v2/typescript-inversify/
java -jar ./swagger-codegen-cli-v2.jar generate -i v2/spec.json -l typescript-fetch -o examples/v2/typescript-fetch/
java -jar ./swagger-codegen-cli-v2.jar generate -i v2/spec.json -l typescript-jquery -o examples/v2/typescript-jquery/
java -jar ./swagger-codegen-cli-v2.jar generate -i v2/spec.json -l typescript-node -o examples/v2/typescript-node/

java -jar ./swagger-codegen-cli-v3.jar generate -i v3/spec.json -l typescript-angular -o examples/v3/typescript-angular/
java -jar ./swagger-codegen-cli-v3.jar generate -i v3/spec.json -l typescript-fetch -o examples/v3/typescript-fetch/

node ../bin/index.js --input v2/spec.json --output examples/v2/openapi-typescript-codegen/
node ../bin/index.js --input v3/spec.json --output examples/v3/openapi-typescript-codegen/
