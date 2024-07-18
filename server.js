/********************************************************************************
 *  WEB322 – Assignment 05
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: _________HaoHanKao_____________ Student ID: ________151604220______ Date: ___07/18/2024___________
 *
 *  Published URL: ____________________https://lego-nptz7hkdw-kaohaohans-projects.vercel.app_______________________________________
 *
 ********************************************************************************/

const express = require("express");
const legoSets = require("./modules/legoSets");
const path = require("path");
//處理表單 table !!!!
const bodyParser = require("body-parser");
//

const app = express();
const port = 3001;

app.use(express.static(`${__dirname}/public`));
app.set("views", path.join(__dirname) + "/views");
app.set("view engine", "ejs");

// for form to get the req body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 初始化 LegoSets 模块
legoSets.initialize();

app.get("/", (req, res) => {
  res.render("home"); // 使用 res.render 而不是 res.sendFile
});

app.get("/lego/sets", (req, res) => {
  let query = req.query;
  let theme = query.theme;

  if (theme) {
    legoSets
      .getSetsByTheme(theme)
      .then((data) => {
        if (data) {
          res.render("sets", { sets: data });
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(404).render("404", {
          message: "No sets found for the specified theme. ",
        });
      });
  } else {
    legoSets
      .getAllSets()
      .then((data) => {
        res.render("sets", { sets: data });
      })
      .catch((error) => {
        res.status(404).render("404", { message: "No sets found." });
      });
  }
});

app.get("/lego/sets/:set_num", (req, res) => {
  let setNum = req.params.set_num;
  legoSets
    .getSetByNum(setNum)
    .then((data) => {
      console.log("data", data);
      res.render("set", { set: data });
    })
    .catch((error) => {
      res.status(404).render("404", { message: "Set not found." });
    });
});
app.get("/about", (req, res) => {
  res.render("about"); // 使用 res.render 而不是 res.sendFile
});
//addSet
// First use legoSets module function get all themes
// so get themData than give themeData to addSet themes
app.get("/lego/addSet", (req, res) => {
  legoSets.getAllThemes().then((themeData) => {
    res.render("addSet", { themes: themeData });
  });
});
app.post("/lego/addSet", (req, res) => {
  let setData = req.body;

  legoSets
    .addSet(setData)
    .then((setData) => {
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    });
});

app.get("/lego/editSet/:num", (req, res) => {
  let setNum = req.params.num;

  legoSets
    .getSetByNum(setNum)
    .then((setData) => {
      if (setData) {
        legoSets.getAllThemes().then((themeData) => {
          res.render("editSet", { themes: themeData, set: setData });
        });
      } else {
        res.status(404).render("404", { message: err });
      }
    })
    .catch((err) => {
      res.status(404).render("404", { message: err });
    });
});

app.post("/lego/editSet", (req, res) => {
  let setData = req.body;
  let setNum = req.body.set_num;
  legoSets
    .editSet(setNum, setData)
    .then(() => {
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    });
});

app.get("/lego/deleteSet/:num", (req, res) => {
  let setNum = req.params.num;

  legoSets
    .deleteSet(setNum)
    .then(() => {
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    });
});

app.use((req, res, next) => {
  res.status(404).render("404", { message: "Page not found." });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
