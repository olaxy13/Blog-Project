const User = require("../../models/User");

const insertUsers = async (users) => {
  try {
    await Promise.all(
      users.map(async (user) => { 
        await User.create(user);
      })
    );
    console.log("All users inserted successfully.");
  } catch (error) {
    console.error("Error inserting users:", error);
  }
};

module.exports = {
  insertUsers,
};