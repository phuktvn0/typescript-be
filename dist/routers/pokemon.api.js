"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function checkNumbers(K) {
    // console.log(/^\d+$/.test(K));
    return /^\d+$/.test(K);
}
const pokemonRouter = express_1.default.Router();
const pokemonTypes = [
    "bug",
    "dragon",
    "fairy",
    "fire",
    "ghost",
    "ground",
    "normal",
    "psychic",
    "steel",
    "dark",
    "electric",
    "fighting",
    "flyingText",
    "grass",
    "ice",
    "poison",
    "rock",
    "water",
];
// delete pokemon
pokemonRouter.delete("/:id", (req, res, next) => {
    try {
        const { id } = req.params;
        // console.log(id);
        //Read data from db.json then parse to JSobject
        const pokemonFilePath = path_1.default.join(__dirname, "../../db.json");
        const pokemonJS = fs_1.default.readFileSync(pokemonFilePath, "utf-8");
        let pokemonDB = JSON.parse(pokemonJS);
        const pokemonList = pokemonDB["pokemon"];
        if (!pokemonList.find((x) => x.id === parseInt(id))) {
            throw new Error("Pokemon not found");
        }
        const pokemonDelete = pokemonList.find((x) => x.id === parseInt(id));
        const newPokemonList = pokemonList.filter((x) => x.id !== parseInt(id));
        // console.log(newPokemonList);
        pokemonDB["pokemon"] = newPokemonList;
        pokemonDB["totalPokemon"] = newPokemonList.length;
        fs_1.default.writeFileSync(path_1.default.join(__dirname, "../../db.json"), JSON.stringify(pokemonDB));
        res.status(200).send(pokemonDelete);
    }
    catch (error) {
        next(error);
    }
});
// post new pokemon
pokemonRouter.post("/", (req, res, next) => {
    try {
        const { id, name, types, url } = req.body;
        // requied data
        if (!id || !name || !types || !url) {
            throw new Error("Missing required data.");
        }
        // 1 or 2 types
        if (types.length > 3) {
            throw new Error("Pokemon can only have one or two types.");
        }
        let newPokemonType = [
            types[0].toLowerCase().trim() || "",
            types[1].toLowerCase().trim() || "",
        ];
        newPokemonType = newPokemonType.filter((x) => pokemonTypes.includes(x));
        if (!newPokemonType.length) {
            throw new Error("Pokemon type is invalid.");
        }
        //Read data from db.json then parse to JSobject
        const pokemonFilePath = path_1.default.join(__dirname, "../../db.json");
        const pokemonJS = fs_1.default.readFileSync(pokemonFilePath, "utf-8");
        let pokemonDB = JSON.parse(pokemonJS);
        const pokemonList = pokemonDB["pokemon"];
        // console.log(pokemon);
        // check pokemon exists by id or by name
        if (pokemonList.find((x) => x.id === id || x.name === name)) {
            throw new Error("Pokemon exists");
        }
        // new Pokemon
        const newPokemon = {
            id,
            name,
            types: newPokemonType,
            url,
        };
        pokemonList.push(newPokemon);
        // console.log(pokemon);
        pokemonDB["pokemon"] = pokemonList;
        pokemonDB["totalPokemon"] = pokemonList.length;
        fs_1.default.writeFileSync(path_1.default.join(__dirname, "../../db.json"), JSON.stringify(pokemonDB));
        res.status(200).send(newPokemon);
    }
    catch (error) {
        next(error);
    }
});
// get all data & fiter
pokemonRouter.get("/", (req, res, next) => {
    const allowedFilters = ["type", "search", "page", "limit"];
    try {
        let _a = req.query, { page, limit } = _a, filterQuery = __rest(_a, ["page", "limit"]);
        // default value
        page = Math.floor(page) || 1;
        limit = Math.floor(limit) || 20;
        // check filter query
        const filterKeys = Object.keys(filterQuery);
        filterKeys.forEach((key) => {
            if (!allowedFilters.includes(key)) {
                throw new Error(`Query ${key} is not allowed`);
            }
            if (!filterQuery[key])
                delete filterQuery[key];
        });
        //Number of items skip for selection
        let offset = limit * (page - 1);
        //Read data from db.json then parse to JSobject
        const pokemonFilePath = path_1.default.join(__dirname, "../../db.json");
        const pokemonJS = fs_1.default.readFileSync(pokemonFilePath, "utf-8");
        let pokemonDB = JSON.parse(pokemonJS);
        const pokemon = pokemonDB["pokemon"];
        //Filter data by name, type, id
        let result = [];
        if (filterKeys.length) {
            filterKeys.forEach((condition) => {
                let filterValue = filterQuery[condition];
                filterValue = filterValue.toLowerCase().trim();
                switch (condition) {
                    case "search":
                        if (checkNumbers(filterValue)) {
                            result = result.length
                                ? result.filter((x) => x["id"] === parseInt(filterValue))
                                : pokemon.filter((x) => x["id"] === parseInt(filterValue));
                        }
                        else {
                            result = result.length
                                ? result.filter((x) => x["name"].includes(filterValue))
                                : pokemon.filter((x) => x["name"].includes(filterValue));
                        }
                        break;
                    case "type":
                        result = result.length
                            ? result.filter((x) => x["types"].includes(filterValue))
                            : pokemon.filter((x) => x["types"].includes(filterValue));
                        break;
                    default:
                        result = result.length
                            ? result.filter((x) => x[condition] === filterValue)
                            : pokemon.filter((x) => x[condition] === filterValue);
                }
            });
        }
        else {
            result = pokemon;
        }
        // select number of result by offset
        result = result.slice(offset, offset + limit);
        //send response
        const responseData = {
            data: result,
            totalPokemons: result.length,
        };
        res.status(200).send(responseData);
    }
    catch (error) {
        next(error);
    }
});
exports.default = pokemonRouter;
