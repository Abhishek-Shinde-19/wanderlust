const mongoose = require("mongoose");
const Review = require("./review.js");
const { string } = require("joi");

const listingSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    image:{
        url:String,
        filename:String,
    },
    price:{
        type:Number,
        required:true,
    },
    location:{
        type:String,
        required:true,
    },
    country:{
        type:String,
        required:true,
    },
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
});

//delete middleware
listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
        await Review.deleteMany({_id : {$in:listing.reviews}});
    }
})

const listing = mongoose.model("listing",listingSchema);

module.exports=listing;