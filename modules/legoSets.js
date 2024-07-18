//This will allow us to access the DB_USER,
//DB_DATABASE, etc. values from the ".env" file using the "process.env" syntax,
require("dotenv").config();

//connect DB
//node modules/legoSets
const Sequelize = require("sequelize");
const pg = require("pg");
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    dialectModule: pg,
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });

//table1
//改註解
// Define a "Theme" model
const Theme = sequelize.define(
  "Theme",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

// Define a "Set" model
//改註解
const Set = sequelize.define(
  "Set",
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

// Define the relationship between the two models
//改註解
Set.belongsTo(Theme, { foreignKey: "theme_id" });
//
//
//start initialize sequelize
function initialize() {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getAllSets() {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [
        {
          model: Theme,
        },
      ],
    })
      .then((sets) => {
        resolve(sets);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    try {
      //this class has many functions. I can use it. like findOne()
      Set.findOne({
        where: { set_num: setNum },
        include: [
          {
            model: Theme,
          },
        ],
      }).then((set) => {
        resolve(set);
      });
    } catch (error) {
      reject("Unable to find requested set");
    }
  });
}

function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [
        {
          model: Theme,
        },
      ],
      //find the set you want to look for. and then 再從這個set 找theme
      where: {
        "$Theme.name$": {
          [Sequelize.Op.iLike]: `%${theme}%`,
        },
      },
    })
      .then((sets) => {
        resolve(sets);
      })
      .catch((error) => {
        reject("Unable to find requested sets");
      });
  });
}

function addSet(setData) {
  return new Promise((resolve, reject) => {
    Set.create({
      set_num: setData.set_num,
      name: setData.name,
      year: setData.year,
      theme_id: setData.theme_id,
      num_parts: setData.num_parts,
      img_url: setData.img_url,
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error.errors[0].message);
      });
  });
}

function getAllThemes() {
  return new Promise((resolve, reject) => {
    Theme.findAll({})
      .then((sets) => {
        resolve(sets);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function editSet(set_num, setData) {
  return new Promise((resolve, reject) => {
    Set.update(setData, {
      //用where 挑出我要的set 把set_num傳到set_num
      where: {
        set_num: set_num,
      },
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error.errors[0].message);
      });
  });
}
function deleteSet(set_num) {
  return new Promise((resolve, reject) => {
    Set.destroy({
      //用where 挑出我要的set 把set_num傳到set_num
      where: {
        set_num: set_num,
      },
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error.errors[0].message);
      });
  });
}

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  getAllThemes,
  editSet,
  deleteSet,
};
