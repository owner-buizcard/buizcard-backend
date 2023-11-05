const mongoose = require("mongoose");

let conn = null;

const _DBException = (message) => {
  this.message = message;
  this.name = "DBException";
};

module.exports.openDBConnection = async () => {
  try {
    const dbUrl = 'mongodb+srv://tobirama:tobirama@formly-dev.d7shzqk.mongodb.net/dev?retryWrites=true&w=majority';

    if (!dbUrl) {
      throw new _DBException("DB connection string not valid");
    }
    if (!mongoose.connection.readyState) {
      console.log("Opening new Connection");
      conn = await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      return conn;
    } else {
      console.log("Reusing the existing DB connection.");
      return conn;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports.closeDBConnnection = async (db) => {};
