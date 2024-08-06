FROM node:22
COPY docker-package.json /app/package.json
RUN cd /app && npm install --omit=dev
WORKDIR /app
CMD ["node", "dist/main.mjs"]
EXPOSE 8080
