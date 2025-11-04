const mongoose=require("mongoose");
const Review = require("./review.js");
const Schema= mongoose.Schema;

const listingSchema= new Schema({
    title: {
        type:String,
        require:true,
    },
    description: {
        type:String,
        require:true,
    },
    image: {
        type:String,
        default:
            "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
        set:(v)=>
            v===""?"https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070"
        :v
    },
    price: {
        type:Number,
        require:true,
    },
    location: {
        type:String,
        require:true,
    },
    country: {
        type:String,
        require:true,
    },
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        }
    ]
})

const listing= mongoose.model("listing",listingSchema);

module.exports=listing;