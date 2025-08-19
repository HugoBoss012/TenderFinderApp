# Tender Finder — Client Side (React)

This is the frontend for the Tender Finder case. It is built with **React (Vite)** and connects to the Node/Express API.

## Features

## Requirements

## Setup
```bash
cd client
npm install

# TenderFinderApp

TenderFinderApp is a full-stack web application for browsing and visualizing tender data. It features a React frontend and a Node.js/Express backend with a SQLite database. This README provides step-by-step instructions for running the app locally.

## Features
- Browse tenders in a list view
- Visualize tenders on a map
- Search and filter tenders
- UI built with React and Vite
- Backend API with Express and SQLite

---

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/HugoBoss012/TenderFinderApp.git
cd TenderFinderApp
```

### 2. Install Dependencies
#### Server
```bash
cd server
npm install
```
#### Client
```bash
cd ../client
npm install
```

---

### 3. Set Up the Database
1. Ensure you are in the `server` directory:
	```bash
	cd ../server
	```
2. Run the seed script to initialize the database:
	```bash
	npm run seed
	```
	This will create and populate `tenderfinder.db` using `schema.sql` and `data/full_stack_case_data.csv`.

---

### 4. Start the Backend Server
```bash
npm start
```
The server will start on [http://localhost:3001](http://localhost:3001) by default.

---

### 5. Start the Frontend (React/Vite)
```bash
cd ../client
npm run dev
```
The frontend will start on [http://localhost:5173](http://localhost:5173) by default.

---

## Usage
- Open [http://localhost:5173](http://localhost:5173) in your browser.
- Browse tenders, use the map view, and search/filter as needed.

---

## Environment Variables
- The backend uses a `.env` file for configuration (e.g., port, database path). Example:
  ```env
  PORT=3001
  DB_PATH=./tenderfinder.db
  ```

---

## Troubleshooting
- If you encounter issues with database setup, ensure Node.js has permission to read/write files in the `server` directory.
- Make sure both server and client are running before accessing the frontend.
- For CORS issues, check the backend's Express configuration.


