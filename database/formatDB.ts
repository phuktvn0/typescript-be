import csv from "csvtojson";
import * as fs from "fs";
import * as path from "path";

const pokemonData = async () => {
  //   interface newData {
  //     id?: Number;
  //     Name: String;
  //     Type1: String;
  //     Type2?: String;
  //     url?: String;
  //   }
  //   interface newDataList extends Array<newData> {}
  let newData = await csv().fromFile("./database/pokemon.csv");
  //   console.log(newData);
  newData = newData.slice(0, 721);
  newData = newData.map((e, i) => {
    i += 1;
    const types: Array<string> = [];
    if (e.Type2) {
      types.push(e.Type1.toLowerCase(), e.Type2.toLowerCase());
    } else {
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
  let data: any = fs.readFileSync(path.join(__dirname, "../db.json"));
  data = JSON.parse(data);
  data.pokemon = [];
  data.pokemon = newData;
  data.totalPokemon = newData.length;
  fs.writeFileSync(path.join(__dirname, "../db.json"), JSON.stringify(data));
};

pokemonData();
