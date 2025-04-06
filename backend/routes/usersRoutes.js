// // backend/server.js
// const express = require('express');
// const cors = require('cors'); // Optional, if you want to enable CORS
// const { createTablesUsers } = require('../config/sqlsetup.js'); // Ensure this file exists and the function is exported

// const app = express();
// const port = 3000;

// // Use CORS (optional, if you're working with a frontend on a different origin)
// app.use(cors());

// // Middleware to parse JSON request bodies
// app.use(express.json());

// // Test route
// app.get('/', (req, res) => {
//   res.send('Hello, welcome to the server!');
// });

// // Dynamically import the MongoDB setup module and start the server
// (async () => {
//   try {
//     const { connectToMongo, run } = await import('../config/mongodbsetup.mjs'); // Ensure correct order of imports
//     await connectToMongo(); // Call the function to establish the MongoDB connection
//     await run(); // Ensure the 'run' function is used
//     console.log('MongoDB connected');

//     // Optionally, create tables in PostgreSQL (if needed)
//     createTablesUsers();

//     // Start the server
//     app.listen(port, () => {
//       console.log(`Server running on http://localhost:${port}`);
//     });
//   } catch (err) {
//     console.error('Error connecting to MongoDB:', err);
//   }
// })();
