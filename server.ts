// Importing module
import express from "express";
import pokemonRouter from "./routers/pokemon.api";

const app: express.Application = express();
const PORT: Number = 8000;

// Handling GET / Request
app.get("/", (req: express.Request, res: express.Response) => {
  res.status(200).send("Welcome to typescript backend!");
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// pokemon router
app.use("/pokemon", pokemonRouter);

// Server setup
app.listen(PORT, () => {
  console.log(
    "The application is listening " + "on port http://localhost:" + PORT
  );
});
