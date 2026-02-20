import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    const error = new Error("Acceso denegado, token requerido");
    error.status = 401;
    return next(error);
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    console.log("Decoded JWT:", verified);
    next();
  } catch {
    const error = new Error("Token inválido");
    error.status = 400;
    next(error);
  }
}