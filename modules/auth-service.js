require("dotenv").config();
//驗證
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User; // to be defined on new connection (see initialize)

// 初始化 initialize "User"
//using createConnection() will ensure that we use a connection local to our module
const initialize = () => {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB_URI);
    db.on("error", (err) => {
      reject(err); //  connection has an error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve(); //connection is successful
    });
  });
};

// Register function
const registerUser = (userData) => {
  //user has those properties
  let { userName, userAgent, email, password, password2 } = userData;

  return new Promise((resolve, reject) => {
    //check password matches or not
    if (password != password2) {
      return reject("Passwords do not match");
    }

    //If password match, create a new user(new一個user拉)
    let newUser = new User({
      userName: userData.userName,
      password: userData.password,
      email: userData.email,
      loginHistory: [],
    });

    //Then save this new object
    newUser
      .save()
      .then(() => {
        //everything is good.
        console.log("User is saved!!!!!!");
        resolve();
      })
      .catch((err) => {
        //if user name is alread taken
        // err.code is 11000 (duplicate key),
        if (err.code === 11000) {
          reject("User Name already taken");
        } else {
          reject(`There was an error: ${err}`);
        }
      });
  });
};

//checkUser function
// Find the user in the database whose userName == userData.userName

const checkUser = (userData) => {
  return new Promise((resolve, reject) => {
    //find return array object
    User.find({ userName: userData.userName })
      .exec()
      .then((users) => {
        //cant find user
        if (users.length === 0) {
          return reject(`Unable to find user: ${userData.userName}`);
        }
        let user = users[0];
        //didn't match
        if (user.password !== userData.password) {
          return reject(`Incorrect Password for user: ${userData.userName}`);
        }
        //record login history
        if (user.loginHistory.length === 8) {
          user.loginHistory.pop();
        }
        user.loginHistory.unshift({
          dateTime: new Date().toString(),
          userAgent: userData.userAgent,
        });

        //updated user login history
        User.updateOne(
          { userName: user.userName },
          { $set: { loginHistory: user.loginHistory } }
        )
          .then(() => {
            resolve(user);
          })
          .catch((err) => {
            reject(`There was an error verifying the user: ${err}`);
          });
      })
      .catch((err) => {
        //If the find() promise was rejected
        reject(`Unable to find user: ${userData.userName}`);
      });
  });
};
