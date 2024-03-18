import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import { connectDB } from './Database/db.js';
import userRoutes from './Routes/userRoutes.js'

dotenv.config();
const app = express();
connectDB();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.send("Server is Live");
})

// middeware
app.use(express.json());

// routers
app.use("/api/v1", userRoutes);

app.listen(PORT, ()=> {
    console.log(`Server is running on PORT ${PORT}`.yellow.bold);
});
