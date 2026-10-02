export function errorHandler(err, req, res, next) {
  console.error("[ERROR]", err);
  const status = err.status || 500;
  res.status(status).json({ detail: err.message || "Server error" });
}