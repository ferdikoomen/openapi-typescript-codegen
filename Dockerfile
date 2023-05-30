FROM node:alpine AS builder
WORKDIR /usr/src/openapi

COPY ["package.json", "package-lock.json", "./"]
RUN ["npm", "install"]

COPY . /usr/src/openapi
RUN npm run release

FROM node:alpine
WORKDIR /usr/src/openapi
COPY ["package.json", "package-lock.json", "./"]
RUN npm install --production
COPY --from=builder /usr/src/openapi/dist/index.js /usr/src/openapi/dist/index.js
COPY --from=builder /usr/src/openapi/bin/index.js /usr/src/openapi/bin/index.js
ENTRYPOINT [ "node", "/usr/src/openapi/bin/index.js" ]
CMD "--help"

