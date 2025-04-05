# Financial Sentiment & Budget Analyzer Backend

This is the backend service for the Financial Sentiment & Budget Analyzer application. It provides APIs for financial news analysis, stock predictions, and budget management.

## Features

- Financial news sentiment analysis using Gemini API
- Stock prediction based on market sentiment and risk tolerance
- Budget management and tracking
- Bill scheduling and shortfall detection
- Transaction tracking with credit/debit differentiation
- Purchase evaluation with AI-powered recommendations
- Custom financial advice based on personal financial context
- Bill payment risk assessment and prioritization

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Google's Gemini API
- Winston (logging)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB instance
- Gemini API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=development
   ```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Financial Module

#### GET /api/financial-news
Fetches recent financial news with sentiment analysis.

#### POST /api/predict-stock
Provides stock predictions based on sentiment and risk tolerance.

### Budget Module

#### GET /api/budget
Retrieves current budget details.

#### POST /api/budget/update
Updates budget information.

#### GET /api/bills
Lists all scheduled bills.

### Transaction & Analysis Module

#### GET /api/transactions
Retrieves user transactions with optional filtering by date, category, or type.

#### POST /api/transaction
Adds a new transaction with automatic credit/debit classification.

#### GET /api/balance
Gets current balance based on all transactions.

#### GET /api/predict-shortfall
Predicts if user will miss upcoming bill payments and provides risk analysis.

#### POST /api/evaluate-purchase
Analyzes if a potential purchase is a good financial decision.

#### POST /api/financial-advice
Provides customized financial advice based on the user's specific situation and question.

For detailed API documentation and implementation details, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request