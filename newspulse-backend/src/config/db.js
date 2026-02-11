import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado ✅");
  } catch (error) {
    console.error("Error al conectar MongoDB:", error.message);
    process.exit(1); // detiene el proceso si falla
  }
}

export default connectDB;