FROM node:22.12-slim
WORKDIR /app
COPY . /app/
RUN npm install
RUN chmod +x node_modules/.bin/webpack
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
