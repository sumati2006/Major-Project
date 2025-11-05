
const mongoose=require("mongoose");
const {Schema}= mongoose;

const reviewSchema= new Schema({
    comment:String,
    rating:{
        type:Number,
        min: 1,
        max:5,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    }
});

const review=new mongoose.model("review",reviewSchema);
module.exports=review;