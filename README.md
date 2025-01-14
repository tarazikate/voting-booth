
# Voting Booth Application

The Voting Booth Application is a simple web-based tool for managing voting processes. Users can register voters, view candidates, and cast ballots. The application is built using Node.js for the backend, MongoDB for the database, and Apache for proxying and serving the front end.

## Features
- Register voters and candidates.
- Cast votes and track ballots.
- View results in real-time.
- Designed with modular front-end and back-end folders for easier management.

## Prerequisites
Ensure the following are installed and up-to-date:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Apache HTTP Server](https://httpd.apache.org/)

## Setting Up the Application

### Step 1: Back-End Setup
- Navigate to the `back` folder in the terminal.
- Run the command: npm install mongodb
- Running the above command downloads the mongodb package with its dependencies, creates a node_modules folder if needed, and updates package.json with the package in dependencies (if package.json exists).

### Step 2: Apache Proxy Configuration
- Open your Apache configuration file `proxy-html.conf` and add the following lines:
```apache
ProxyPass /api/candidates http://127.0.0.1:3006
ProxyPassReverse /api/candidates http://127.0.0.1:3006

ProxyPass /api/voters http://127.0.0.1:3002
ProxyPassReverse /api/voters http://127.0.0.1:3002
```

- Open the `html.conf` file (or your site's equivalent Apache configuration file) and add the following:
```apache
Alias /votingbooth /path/to/front-folder

<Directory /path/to/front-folder>
    Options Indexes
    AllowOverride none
    Require all granted
</Directory>
```
- Replace _/path/to/front-folder_ with the actual path to the front folder in your project.
- You can change the ports (e.g., 3006 for candidates and 3002 for voters) to any desired port by updating the Apache proxy-html.conf file and the port variables in candidates.js and voter.js files.
- If the desired port is already in use, you may encounter errors. To resolve this:
- Find the conflicting process using:
```apache
lsof -i :<port>
```
- Kill the process:
```apache
kill -9 <PID>
```

### Step 3: Configure Enviromental Variables
-  Create a `.env` file in the `back` folder.
-  In your `.env` file, add the following line:
 ```
 MONGODB_URI= approproiate MongoDB connection string
 ```
- Don't upload the `.env` file to GitHub. It is included in the `.gitignore` file by default to keep it private.
- Install the `dotenv` package by running:
 ```
   npm install dotenv
```

## How to Run
- To start MongoDB navigate to the MongoDB folder and run: _mongod --dbpath ./data/db_
- Open a new terminal window and start Apache.
- Open another terminal window, navigate to the `back` folder, and run: _node voter.js_
- Do the above step for candidates.js on another window
- Open your browser and visit: http://localhost:8080/votingbooth/index.html

## Additional Notes
- Make sure all services (MongoDB, Apache, and Node.js scripts) are running simultaneously for the application to function correctly.
