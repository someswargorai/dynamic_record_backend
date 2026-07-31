const express = require("express");
const cors = require("cors");
const db_connection = require("./lib/db_connection");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
    cors({
        origin: "*",
        methods: ["GET","POST","PUT","DELETE","PATCH"],
        credentials: true
    })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const templateRoutes = require("./routes/templateRoutes");

app.get("/",(req,res)=>{
    res.json("Dynamic Record backend is listening on 3001")
})
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/templates", templateRoutes);

(async()=>{
    await db_connection();
    app.listen(3001, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();
