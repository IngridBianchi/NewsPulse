import winston from "winston";

const logger = winston.createLogger({
  level: "info", // nivel mínimo que se loguea
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // logs en formato JSON con timestamp
  ),
  transports: [
    // Consola (útil en desarrollo)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Archivo de logs generales
    new winston.transports.File({ filename: "logs/app.log" }),
    // Archivo de errores
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
  ],
});

export default logger;