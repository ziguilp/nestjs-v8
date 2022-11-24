FROM node:14.19-alpine3.14 as dist
RUN yarn config set registry https://registry.npm.taobao.org/
WORKDIR /app
COPY package.json yarn.lock tsconfig.json tsconfig.build.json nest-cli.json ormconfig.ts ./
COPY src ./src
RUN yarn
RUN yarn run build  

# FROM node:14.19-alpine3.14 as node_modules
# RUN yarn config set registry https://registry.npm.taobao.org/
# WORKDIR /tmp
# COPY package.json yarn.lock ./
# RUN yarn install --production

# FROM node:14.19-alpine3.14
# WORKDIR /app
# COPY --from=node_modules /tmp/node_modules ./node_modules
# COPY --from=dist /tmp/src ./src
# COPY --from=dist /tmp/dist ./dist

CMD ["node", "dist/src/main.js"]