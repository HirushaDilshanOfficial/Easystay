const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const MONGO_URI = process.env.MONGO_URI;

module.exports = {
  PORT,
  NODE_ENV,
  MONGO_URI
};