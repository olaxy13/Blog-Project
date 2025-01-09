const mongoose = require("mongoose");
//const { server } = require("../../server");


const setupTestDB = () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("db connected");
  });

  beforeEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) =>
        collection.deleteMany({})
      )
    );
  }, 10000);

  // afterAll((done) => {
  //   server.close(done);
  // });

  afterAll(async () => {
    await mongoose.disconnect();
  });
};

module.exports = setupTestDB;