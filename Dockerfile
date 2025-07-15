# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./

# Install the project dependencies
RUN npm install

# Install additional dependencies individually (if needed)
RUN npm install axios --legacy-peer-deps
RUN npm install express cors mssql winston path dotenv mysql2 sequelize --legacy-peer-deps
RUN npm install js-md4 --save
RUN npm install @sendgrid/mail
RUN npm install moment
RUN npm install nodemailer
RUN npm install ip-range-check

# Install nodemon globally for hot reload support
RUN npm install -g nodemon

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the app runs on (3100)
EXPOSE ${PORT}

#
# Use nodemon to start the app and watch for file changes (hot reload)
# CMD ["nodemon", "--watch", ".", "--exec", "node", "server.js"]
CMD ["npx", "nodemon", "--watch", ".", "--exec", "node", "server.js"]
