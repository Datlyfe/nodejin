import express from "express";
import cors from "cors";
import bp from "body-parser";

const app = express();
const port = process.env.PORT || 3000;

app.use(bp.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Ready" });
});

app.listen(port, () => {
  console.log(`Server ready, Listenning on port ${port}`);
});
