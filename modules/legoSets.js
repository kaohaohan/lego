const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

function initialize() {
  return new Promise((resolve, reject) => {
    try {
      setData.forEach((set) => {
        let themeId = set.theme_id;

        let result = themeData.find((theme) => {
          return themeId == theme.id;
        });
        set.theme = result.name;
        sets.push(set);
      });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function getAllSets() {
  return new Promise((resolve, reject) => {
    try {
      resolve(sets);
    } catch (error) {
      reject(error);
    }
  });
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    try {
      let result = sets.find((set) => {
        return set.set_num == setNum;
      });
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    try {
      let results = [];
      for (let i = 0; i < sets.length; i++) {
        if (sets[i].theme.toUpperCase() == theme.toUpperCase()) {
          results.push(sets[i]);
        }
      }

      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
}
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };
