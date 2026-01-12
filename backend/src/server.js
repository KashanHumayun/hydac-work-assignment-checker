const app = require('./app');
const { loadMatrix } = require('./data/matrixLoader');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    // Load matrix into memory on startup
    await loadMatrix();
    app.listen(PORT, () => {
      logger.info(`HYDAC backend running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
