FROM node:alpine
WORKDIR /usr/src/openapi

COPY ["package.json", "package-lock.json", "./"]
RUN ["npm", "install"]

COPY . /usr/src/openapi
RUN npm run release
ENTRYPOINT [ "node", "/usr/src/openapi/bin/index.js" ]
CMD "--help"
