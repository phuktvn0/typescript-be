"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing module
const express_1 = __importDefault(require("express"));
const pokemon_api_1 = __importDefault(require("./routers/pokemon.api"));
const app = (0, express_1.default)();
const PORT = 8000;
// Handling GET / Request
app.get("/", (req, res) => {
    res.status(200).send("Welcome to typescript backend!");
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// pokemon router
app.use("/pokemon", pokemon_api_1.default);
// Server setup
app.listen(PORT, () => {
    console.log("The application is listening " + "on port http://localhost:" + PORT);
});
