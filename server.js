require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./connections/database");
const { errorHandler } = require("./middlewares/error.middleware");

connectDB();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/users", require("./routes/user.routes"))
app.use("/api/pins", require("./routes/pin.routes"))
app.use("/api/boards", require("./routes/board.routes"))

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
