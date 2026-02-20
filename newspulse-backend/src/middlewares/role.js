export default function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    console.log("User role in request:", req.user?.role);
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      const error = new Error("Acceso denegado: permisos insuficientes");
      error.status = 403;
      return next(error);
    }
    next();
  };
}