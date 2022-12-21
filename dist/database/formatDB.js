"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const csvtojson_1 = __importDefault(require("csvtojson"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pokemonData = () => __awaiter(void 0, void 0, void 0, function* () {
    //   interface newData {
    //     id?: Number;
    //     Name: String;
    //     Type1: String;
    //     Type2?: String;
    //     url?: String;
    //   }
    //   interface newDataList extends Array<newData> {}
    let newData = yield (0, csvtojson_1.default)().fromFile("./database/pokemon.csv");
    //   console.log(newData);
    newData = newData.slice(0, 721);
    newData = newData.map((e, i) => {
        i += 1;
        const types = [];
        if (e.Type2) {
            types.push(e.Type1.toLowerCase(), e.Type2.toLowerCase());
        }
        else {
            types.push(e.Type1.toLowerCase());
        }
        return {
            id: i,
            name: e.Name,
            types: types,
            url: `http://localhost:5000/images/${i}.png`,
        };
    });
    //   console.log(newData);
    let data = fs.readFileSync(path.join(__dirname, "../db.json"));
    data = JSON.parse(data);
    data.pokemon = [];
    data.pokemon = newData;
    data.totalPokemon = newData.length;
    fs.writeFileSync(path.join(__dirname, "../db.json"), JSON.stringify(data));
});
pokemonData();
