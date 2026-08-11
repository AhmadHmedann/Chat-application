import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
const port = 4000;

const messages = [];

app.listen(port,()=> {
    console.error(`Chat server listening on port ${port}`)
});