import express from "express";
import fs from "fs";
import createError from "http-errors";
import httpStatus from "http-status";
import path from "path";
import Joi, { array, types } from "joi";

function checkNumbers(K: string) {
  // console.log(/^\d+$/.test(K));
  return /^\d+$/.test(K);
}

const pokemonRouter: express.Router = express.Router();
const pokemonFilePath = path.join(__dirname, "../../db.json");
const pokemonTypes: Array<string> = [
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
// default data
interface inforPokemon {
  id: number;
  name: string;
  types: Array<string>;
  url: string;
}

// put data pokemon
pokemonRouter.put(
  "/:id",
  (
    req: express.Request<
      { id: number },
      never,
      {
        name: string;
        types: Array<string>;
        url: string;
      }
    >,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let { id } = req.params;
      const { name, types, url } = req.body;

      if (!name && !types && !url) {
        throw new Error("Missing data");
      }
      id = Math.floor(id);

      // 1 or 2 types
      if (types) {
        if (types.length > 2) {
          throw new Error("Pokemon can only have one or two types.");
        }
        if (
          !types.filter((x: string) => pokemonTypes.includes(x.toLowerCase()))
            .length
        ) {
          throw new Error("Pokemon type is invalid.");
        }
      }

      //Read data from db.json then parse to JSobject
      const pokemonJS = fs.readFileSync(pokemonFilePath, "utf-8");
      let pokemonDB: object = JSON.parse(pokemonJS);
      let pokemonList: Array<inforPokemon> = pokemonDB["pokemon"];

      // Pokemon not found
      if (!pokemonList.find((x) => x.id === id)) {
        throw new Error("Pokemon not found");
      }

      // new pokemon data
      pokemonList.forEach((x) => {
        if (x.id === id) {
          name ? (x.name = name) : (x.name = x.name);
          types ? (x.types = types) : (x.types = x.types);
          url ? (x.url = url) : (x.url = x.url);
        }
      });

      const pokemonUpdate = pokemonList.find((x) => x.id === id);

      pokemonDB["pokemon"] = pokemonList;
      pokemonDB["totalPokemon"] = pokemonList.length;
      fs.writeFileSync(
        path.join(__dirname, "../../db.json"),
        JSON.stringify(pokemonDB)
      );

      res.status(200).send(pokemonUpdate);
    } catch (error) {
      next(error);
    }
  }
);

// delete pokemon
pokemonRouter.delete(
  "/:id",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { id } = req.params;
      // console.log(id);
      //Read data from db.json then parse to JSobject
      const pokemonJS = fs.readFileSync(pokemonFilePath, "utf-8");
      let pokemonDB: object = JSON.parse(pokemonJS);
      const pokemonList: Array<inforPokemon> = pokemonDB["pokemon"];

      // Pokemon not found
      if (!pokemonList.find((x) => x.id === parseInt(id))) {
        throw new Error("Pokemon not found");
      }

      const pokemonDelete = pokemonList.find((x) => x.id === parseInt(id));
      const newPokemonList = pokemonList.filter((x) => x.id !== parseInt(id));
      // console.log(newPokemonList);

      pokemonDB["pokemon"] = newPokemonList;
      pokemonDB["totalPokemon"] = newPokemonList.length;
      fs.writeFileSync(
        path.join(__dirname, "../../db.json"),
        JSON.stringify(pokemonDB)
      );

      res.status(200).send(pokemonDelete);
    } catch (error) {
      next(error);
    }
  }
);

// post new pokemon
pokemonRouter.post(
  "/",
  (
    req: express.Request<
      never,
      never,
      {
        id: number;
        name: string;
        types: Array<string>;
        url: string;
      }
    >,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { id, name, types, url } = req.body;

      // requied data
      if (!id || !name || !types || !url) {
        throw new Error("Missing required data.");
      }

      // 1 or 2 types
      if (types.length > 2) {
        throw new Error("Pokemon can only have one or two types.");
      }

      let newPokemonType: Array<string> = [
        types[0].toLowerCase().trim() || "",
        types[1].toLowerCase().trim() || "",
      ];

      newPokemonType = newPokemonType.filter((x: string) =>
        pokemonTypes.includes(x)
      );
      if (!newPokemonType.length) {
        throw new Error("Pokemon type is invalid.");
      }

      //Read data from db.json then parse to JSobject
      const pokemonJS = fs.readFileSync(pokemonFilePath, "utf-8");
      let pokemonDB: object = JSON.parse(pokemonJS);
      const pokemonList: Array<inforPokemon> = pokemonDB["pokemon"];
      // console.log(pokemon);

      // check pokemon exists by id or by name
      if (pokemonList.find((x) => x.id === id || x.name === name)) {
        throw new Error("Pokemon exists");
      }

      // new Pokemon
      const newPokemon: inforPokemon = {
        id,
        name,
        types: newPokemonType,
        url,
      };
      pokemonList.push(newPokemon);
      // console.log(pokemon);
      pokemonDB["pokemon"] = pokemonList;
      pokemonDB["totalPokemon"] = pokemonList.length;
      fs.writeFileSync(
        path.join(__dirname, "../../db.json"),
        JSON.stringify(pokemonDB)
      );
      res.status(200).send(newPokemon);
    } catch (error) {
      next(error);
    }
  }
);

// get all data & fiter
pokemonRouter.get(
  "/",
  (
    req: express.Request<
      never,
      never,
      never,
      {
        page: number;
        limit: number;
        types: string;
        search: string;
      }
    >,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const allowedFilters = ["types", "search", "page", "limit"];
    try {
      let { page, limit, ...filterQuery } = req.query;
      // default value
      page = Math.floor(page) || 1;
      limit = Math.floor(limit) || 20;

      // check filter query
      const filterKeys = Object.keys(filterQuery);

      filterKeys.forEach((key: string) => {
        if (!allowedFilters.includes(key)) {
          throw new Error(`Query ${key} is not allowed`);
        }
        if (!filterQuery[key]) delete filterQuery[key];
      });

      //Number of items skip for selection
      let offset: number = limit * (page - 1);

      //Read data from db.json then parse to JSobject
      const pokemonJS = fs.readFileSync(pokemonFilePath, "utf-8");
      let pokemonDB: object = JSON.parse(pokemonJS);
      const pokemon: Array<inforPokemon> = pokemonDB["pokemon"];

      //Filter data by name, type, id
      let result: Array<inforPokemon> = [];

      if (filterKeys.length) {
        filterKeys.forEach((condition: string) => {
          let filterValue = filterQuery[condition as keyof typeof filterQuery];

          filterValue = filterValue.toLowerCase().trim();

          switch (condition) {
            case "search":
              if (checkNumbers(filterValue)) {
                result = result.length
                  ? result.filter((x) => x["id"] === parseInt(filterValue))
                  : pokemon.filter((x) => x["id"] === parseInt(filterValue));
              } else {
                result = result.length
                  ? result.filter((x) => x["name"].includes(filterValue))
                  : pokemon.filter((x) => x["name"].includes(filterValue));
              }
              break;
            case "types":
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
      } else {
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
    } catch (error) {
      next(error);
    }
  }
);

export default pokemonRouter;
