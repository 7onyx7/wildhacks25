const mockDatabase = require('./mockDb');
const { logger } = require('./logger');

// Export the mock database for now
// When you're ready to use the real MongoDB, you can replace this file
module.exports = mockDatabase;