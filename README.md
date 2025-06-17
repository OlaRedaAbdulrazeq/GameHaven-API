# GameHaven API

A RESTful backend API for managing an online game store, built with **Node.js**, **Express**, and **MongoDB**. It supports user authentication, game management, cart functionality, and orders.

## Features

- User authentication with JWT
- Role-based access (admin, user)
- Game management (create, update, delete, list)
- Image uploads (via Multer)
- Shopping cart functionality
- Order creation and history
- Reviews per game (one per user)
- Categories/tags and filtering

## Project Setup and Usage

### 1. Clone the Repository

```bash
git clone https://github.com/OlaRedaAbdulrazeq/GameHaven-API.git
cd GameHaven-API
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

### 4. Run the Server

```bash
npm install
npm run dev || npm start
```

## Project Architecture

GameHaven-API/
├── .github/ # GitHub workflows & configurations
├── .husky/ # Git hooks for pre-commit, lint, etc.
├── config/ # App configuration (e.g., DB, Imgbb)
├── controllers/ # Express route controllers
├── middleware/ # Custom middleware (e.g., auth, error handling)
├── models/ # Mongoose schemas
├── node_modules/ # Dependencies
├── public/ # Public assets
├── routes/ # API route definitions
├── services/ # Business logic and service layer
├── tests/ # Unit & integration tests
├── uploads/ # Uploaded image files (locally stored)
├── utils/ # Utility/helper functions
├── validators/ # Validation rules using express-validator
├── .env # Environment variables (not committed)
├── .env.example # Example environment config
├── .gitignore # Git ignore rules
├── .prettierrc / .stylelintrc.\* # Code style config files
├── app.js # Express app initialization
├── server.js # Server entry point
├── eslint.config.mjs # ESLint configuration
├── package.json # Project metadata and scripts
├── README.md # Project documentation

## REST API Endpoints

### Authentication

POST /api/auth/register — Register a new user and receive token

POST /api/auth/login — Login and receive token

### Games

GET /api/games — List all games for logged-in or Guest can add filters

GET /api/games/:id — Get game by ID for logged-in or Guest

POST /api/games — Add a new game (admin only)

PUT /api/games/:id — Update a game (admin only)

DELETE /api/games/:id — Delete a game (admin only)

### revirew

GET /api/games/:id/reviews — Get reviews on game

POST /api/games/:id/reviews — Add a single review for logged-in user

### Cart

GET /api/cart — Get user’s cart for logged-in user

POST /api/cart — Add game to cart for logged-in user

DELETE /api/cart — Remove game from cart for logged-in user

PUT /api/cart/:id — update quantity for logged-in user

DELETE /api/cart/:id — remove item from cart for logged-in user

### Orders

POST /api/orders — Place a new order for logged-in user

GET /api/orders — Get orders history for logged-in user

GET /api/orders/:id — Get specific order for logged-in user
