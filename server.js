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
 *  Published URL: ____________________https://lego-56ngbu3b4-kaohaohans-projects.vercel.app_______________________________________
 *
 ********************************************************************************/

const express = require("express");
const legoSets = require("./modules/legoSets");
const path = require("path");
require("dotenv").config();
//8/4
//Mongo auth service
const authData = require("./modules/auth-service");
//8/4
//Client Session Middleware
// store user credentials and data
const clientSessions = require("client-sessions");

//處理表單 table !!!!
const bodyParser = require("body-parser");
//

const app = express();
const port = 3002;

app.use(express.static(`${__dirname}/public`));
app.set("views", path.join(__dirname) + "/views");
app.set("view engine", "ejs");

// for form to get the req body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 初始化 LegoSets and authData Module
legoSets
  .initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(`Unable to start server: ${err}`);
  });

app.use(
  clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: process.env.SESSIONSECRETE, // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

//make sure every module are able to access to a "session" object((ie: {{session.userName}} for example) )
app.use((req, res, next) => {
  //這個sesion是一種token 他會從req裡面拿到
  //再傳給res.local.session （有點像local storage放資料的地方）
  //以後我的reponse 都會有一個local session 就是我的 req.session;
  //以後只要登入之後 request session 就會有這個 session
  res.locals.session = req.session;
  next();
});

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
app.get("/lego/addSet", ensureLogin, (req, res) => {
  legoSets.getAllThemes().then((themeData) => {
    res.render("addSet", { themes: themeData });
  });
});
//post
app.post("/lego/addSet", ensureLogin, (req, res) => {
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

app.get("/lego/editSet/:num", ensureLogin, (req, res) => {
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

app.post("/lego/editSet", ensureLogin, (req, res) => {
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

app.get("/lego/deleteSet/:num", ensureLogin, (req, res) => {
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

//8/6
//login get
app.get("/login", (req, res) => {
  res.render("login");
});

//8/6
//login post
app.post("/login", (req, res) => {
  //把header裡面的user-Agent 放到req.body
  // user-agent紀錄登入時你的一些系統資訊
  req.body.userAgent = req.get("User-Agent");
  authData
    .checkUser(req.body)
    .then((user) => {
      //用authData 去
      req.session.user = {
        userName: user.userName, // authenticated user's userName
        email: user.email, // authenticated user's email
        loginHistory: user.loginHistory, // authenticated user's loginHistory
      };
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("login", {
        //這個邏輯是當erroMessage 傳進來就會到我error message 去看login.ejs下面寫的條件
        // <% if (typeof errorMessage !== 'undefined') { %>...
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

//8/6
//register get
app.get("/register", (req, res) => {
  res.render("register");
});

//8/6
//register pst
app.post("/register", (req, res) => {
  authData
    .registerUser(req.body)
    .then((user) => {
      res.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

//8/6
app.get("/logout", ensureLogin, (req, res) => {
  req.session.reset();
  res.redirect("/");
});

//8/6
app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

app.use((req, res, next) => {
  res.render("userHistory", { user: req.session.user });
});

//8/6
function ensureLogin(req, res, next) {
  //check req.session.user有沒有東西 只要有login req.session.user 就會有資料
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}
