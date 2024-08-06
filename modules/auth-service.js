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
    bcrypt
      .hash(password, 10)
      .then((hash) => {
        // Hash the password using a Salt that was generated using 10 rounds
        // TODO: Store the resulting "hash" value in the DB
        let newUser = new User({
          userName: userData.userName,
          password: hash,
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
      })
      .catch((err) => {
        console.log(err); // Show any errors that occurred during the process
      });
  });
};

//checkUser function
// Find the user in the database whose userName == userData.userName

const checkUser = (userData) => {
  return new Promise((resolve, reject) => {
    //find return array object
    //我的db裡面的username也沒也跟我輸入的usernameu一樣
    User.find({ userName: userData.userName })
      .exec()
      //點then裡面放call back 換句話說就是promise結果
      .then((users) => {
        //cant find user
        if (users.length === 0) {
          return reject(`Unable to find user: ${userData.userName}`);
        }
        //只要username 是schma 寫了unique username就不會重覆usename再db裡面 所以撈出來資料就只會有一筆
        let user = users[0];
        //didn't match
        bcrypt.compare(userData.password, user.password).then((result) => {
          // result === true if it matches and result === false if it does not match
          if (result == false) {
            return reject(`Incorrect Password for user: ${userData.userName}`);
          }
        });

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

module.exports = {
  checkUser,
  registerUser,
  initialize,
};
