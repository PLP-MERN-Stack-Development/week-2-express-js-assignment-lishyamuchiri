module.exports = function (req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== 'mysecretkey') {
    return res.status(403).json({ error: 'Forbidden - Invalid API Key' });
  }

  next();
};
