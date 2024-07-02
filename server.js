/********************************************************************************
 *  WEB322 – Assignment 04
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: _________HaoHanKao_____________ Student ID: ________151604220______ Date: ___07/02/2024___________
 *
 *  Published URL: ____________________https://github.com/kaohaohan/WEB322_______________________________________
 *
 ********************************************************************************/

const express = require("express");
const legoSets = require("./modules/legoSets");
const path = require("path");

const app = express();
const port = 3001;

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static("public"));

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
      console.log(error);
      res.status(404).render("404", { message: "Set not found." });
    });
});
app.get("/about", (req, res) => {
  res.render("about"); // 使用 res.render 而不是 res.sendFile
});

app.use((req, res, next) => {
  res.status(404).render("404", { message: "Page not found." });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
