module.exports = (err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message || 'Something broke!' });
};
// This is a simple error handling middleware for Express.js applications.