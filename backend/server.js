import "dotenv/config.js";
import connectDB from "./db/dbConnection.js";
import { app } from "./index.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT , () => {
        console.log(`backend running at ${process.env.PORT} : http://localhost:${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log(" \n error in DB connection " , error)
})
