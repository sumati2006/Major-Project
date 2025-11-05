const express=require("express");
const app=express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const path=require("path");
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
const methodOverride = require('method-override')
const wrapAsync=require("./utils/wrapAsync.js")
const ExpressError=require("./utils/ExpressError.js")
const {listingSchema}=require("./schema.js");
const {reviewSchema}=require("./schema.js")


app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,"/public")))
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,"/views"));

const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);


const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust';

main()
    .then(()=>{
        console.log(`connection succesfull`);
    })
    .catch((err)=>{
        console.log(err);
    })

async function main(){
    mongoose.connect(MONGO_URL);
}

//function to validate joi schema
const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        console.log(errMsg)
        next(new ExpressError(400,errMsg));
    }else{
        next();
    }
}
const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        console.log(errMsg)
        next(new ExpressError(400,errMsg));
    }else{
        next();
    }
}


//root
app.get("/",(req,res)=>{
    res.render(`listings/home.ejs`)
});

//index main age og lists
app.get("/listings",wrapAsync(async (req,res)=>{
    let allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}))


//to create new listing from client side
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})
app.post("/listings",validateListing, wrapAsync(async (req, res,next) => {
    const newListing = new Listing( req.body.listing );
    await newListing.save();
    res.redirect("/listings");
}));

//each listing
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}))

//to edit any listing from server side
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}))
//update my listing 
app.put("/listings/:id",validateListing,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const newListing=await Listing.findByIdAndUpdate(id,{...req.body.listing},{ runValidators: true ,new:true});
    res.redirect(`/listings/${id}`);
}))

//delete route
app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect(`/listings`);
}))

//reviews
//post route
app.post("/listings/:id/reviews",validateReview, wrapAsync(async (req, res,next) => {
    let listing1=await Listing.findById(req.params.id);
    const newReview = new Review( req.body.review );
    listing1.reviews.push(newReview);
    await newReview.save();
    await listing1.save();
    console.log(`New review added :${newReview.comment}`)
    res.redirect(`/listings/${req.params.id}`);
}));
//delete route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async (req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    const deletedReview=await Review.findByIdAndDelete(reviewId);
    console.log(`this reviw was deleted:${deletedReview}`);
    res.redirect(`/listings/${id}`);
}));



//page not found
app.all("/*splat",(req,res,next)=>{
    next(new ExpressError(404,"PAGE NOT FOUND"));
})

//error handeling middleware
app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"}=err;
    // console.log(err.stack);
    res.status(statusCode).render("error.ejs",{err});
})

app.listen(8080,()=>{
    console.log(`server listening to port 8080`)
});