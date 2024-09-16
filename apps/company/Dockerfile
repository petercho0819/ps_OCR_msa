# Use Node Alpine as the base image for development
FROM node:alpine as development

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install -g && npm install --force

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build:company

# Create a production image
FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production --force

# Copy built assets from the development stage
COPY --from=development /usr/src/app/dist ./dist

# Copy the rest of the application code
COPY . .

CMD [ "node", "dist/apps/company/main" ]