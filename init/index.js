const mongoose = require("mongoose");
const initData = require("./data.js");
const Listings = require("../models/listings.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
async function main(){
    await mongoose.connect(MONGO_URL);
}


main()
.then(async()=>{
    console.log("connected to DB");
    await initDB();   // ✅ VERY IMPORTANT
})
.catch((err) => {
    console.log(err);
});

const initDB = async () => {
    await Listings.deleteMany({});
    await Listings.insertMany(initData.data);
    console.log("data was initialized");
}
initDB();