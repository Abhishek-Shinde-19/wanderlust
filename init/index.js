const mongoose = require("mongoose");
const Listing = require("../model/listing.js");
const initData = require("./data.js");

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);
})

const initDB = async()=>{
    await Listing.deleteMany({});
    initData.data= initData.data.map((obj)=>({ ...obj, owner:'68f721cf73c5159295070bd3'}));
    await Listing.insertMany(initData.data);
    console.log("Database initlized successfully..");
}

initDB();

