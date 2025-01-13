const mongoose = require("mongoose");
//const { server } = require("../../server");
const { MongoMemoryServer } = require('mongodb-memory-server');
mongoose.Promise = global.Promise;


const setupTestDB = async() => {
  const mongoServer = await MongoMemoryServer.create();
  beforeAll(async () => {
    
    await mongoose.connect(mongoServer.getUri(),  {
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