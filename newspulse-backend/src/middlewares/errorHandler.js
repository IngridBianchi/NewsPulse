export default function errorHandler(err, req, res, next) {
  console.error(err.stack); // log interno

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  });
}