#!/bin/sh

rm -rf dist
rm swagger-codegen-cli-v2.jar
rm swagger-codegen-cli-v3.jar

curl https://repo1.maven.org/maven2/io/swagger/swagger-codegen-cli/2.4.15/swagger-codegen-cli-2.4.15.jar -o swagger-codegen-cli-v2.jar
curl https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.21/swagger-codegen-cli-3.0.21.jar -o swagger-codegen-cli-v3.jar

java -jar ./swagger-codegen-cli-v2.jar generate -i spec/v2.json -l typescript-aurelia -o dist/v2/typescript-aurelia/
java -jar ./swagger-codegen-cli-v2.jar generate -i spec/v2.json -l typescript-angular -o dist/v2/typescript-angular/
java -jar ./swagger-codegen-cli-v2.jar generate -i spec/v2.json -l typescript-inversify -o dist/v2/typescript-inversify/
java -jar ./swagger-codegen-cli-v2.jar generate -i spec/v2.json -l typescript-fetch -o dist/v2/typescript-fetch/
java -jar ./swagger-codegen-cli-v2.jar generate -i spec/v2.json -l typescript-jquery -o dist/v2/typescript-jquery/
java -jar ./swagger-codegen-cli-v2.jar generate -i spec/v2.json -l typescript-node -o dist/v2/typescript-node/

java -jar ./swagger-codegen-cli-v3.jar generate -i spec/v3.json -l typescript-angular -o dist/v3/typescript-angular/
java -jar ./swagger-codegen-cli-v3.jar generate -i spec/v3.json -l typescript-fetch -o dist/v3/typescript-fetch/

node ../bin/index.js --input spec/v2.json --output dist/v2/openapi-typescript-codegen/
node ../bin/index.js --input spec/v3.json --output dist/v3/openapi-typescript-codegen/
