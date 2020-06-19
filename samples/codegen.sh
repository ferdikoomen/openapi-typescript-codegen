#!/bin/sh

curl https://repo1.maven.org/maven2/io/swagger/swagger-codegen-cli/2.4.14/swagger-codegen-cli-2.4.14.jar -o swagger-codegen-cli-v2.jar
curl https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.20/swagger-codegen-cli-3.0.20.jar -o swagger-codegen-cli-v3.jar

echo v2/typescript-aurelia && time java -jar ./swagger-codegen-cli-v2.jar generate -i v2/spec.json -l typescript-aurelia -o examples/v2/typescript-aurelia/ &> /dev/null
echo v2/typescript-angular && time java -jar ./swagger-codegen-cli-v2.jar generate -i v2/spec.json -l typescript-angular -o examples/v2/typescript-angular/ &> /dev/null
echo v2/typescript-inversify && time java -jar ./swagger-codegen-cli-v2.jar generate -i v2/spec.json -l typescript-inversify -o examples/v2/typescript-inversify/ &> /dev/null
echo v2/typescript-fetch && time java -jar ./swagger-codegen-cli-v2.jar generate -i v2/spec.json -l typescript-fetch -o examples/v2/typescript-fetch/ &> /dev/null
echo v2/typescript-jquery && time java -jar ./swagger-codegen-cli-v2.jar generate -i v2/spec.json -l typescript-jquery -o examples/v2/typescript-jquery/ &> /dev/null
echo v2/typescript-node && time java -jar ./swagger-codegen-cli-v2.jar generate -i v2/spec.json -l typescript-node -o examples/v2/typescript-node/ &> /dev/null

echo v3/typescript-angular && time java -jar ./swagger-codegen-cli-v3.jar generate -i v3/spec.json -l typescript-angular -o examples/v3/typescript-angular/ &> /dev/null
echo v3/typescript-fetch && time java -jar ./swagger-codegen-cli-v3.jar generate -i v3/spec.json -l typescript-fetch -o examples/v3/typescript-fetch/ &> /dev/null

echo v2/openapi-typescript-codegen && time node ../bin/index.js --input v2/spec.json --output examples/v2/openapi-typescript-codegen/ &> /dev/null
echo v3/openapi-typescript-codegen && time node ../bin/index.js --input v3/spec.json --output examples/v3/openapi-typescript-codegen/ &> /dev/null

cd examples
find . -type f ! -iname "*.ts" -delete
cd ../
