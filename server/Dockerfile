# Step 1: Base image
FROM node:18

# Step 2: Set working directory inside container
WORKDIR /app

# Step 3: Copy only package.json and package-lock.json first
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy all source code
COPY . .

# Step 6: Expose port (backend server port)
EXPOSE 5000

# Step 7: Start command
CMD ["npm", "start"]
