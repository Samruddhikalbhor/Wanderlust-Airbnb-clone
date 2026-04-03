const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); 
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
async function main(){
    await mongoose.connect(MONGO_URL);
}

main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res) => {
    res.send("Hi I am root");
});

const validateListing = (req,res,next)=>{
     let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, error);
    }else{
        next();
    }
}

app.listen("8080", ()=>{
    console.log("Server is listening to port 8080");
});

app.get("/listings",wrapAsync(async (req,res) => {
   const allListings =  await Listing.find({});
   res.render("listings/index.ejs",{allListings});
}));

// New route
app.get("/listings/new",(req,res) => {
    res.render("listings/new.ejs");
});

// show route
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    res.render("listings/show.ejs",{listing});
}));

// Create route
app.post("/listings",validateListing,wrapAsync(async(req,res,next)=>{
   
    // if(!req.body.listings){
    //     throw new ExpressError(400,"Send valid data for listing!!");
    // }
    const newlisting = new Listing(req.body.listings);
    await newlisting.save();
    res.redirect("/listings");
}));

// UPDATE Route
app.put("/listings/:id",validateListing,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }
    if(!req.body.listings){
        throw new ExpressError(400,"Send valid data for listing!!");
    }
    await Listing.findByIdAndUpdate(id, req.body.listings);
    res.redirect("/listings");
}));

// edit route
app.get("/listings/:id/edit",wrapAsync(async(req,res) => {
    let {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    res.render("listings/edit.ejs",{listing});
}));

// Delete route
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
    let {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// for checking pur[pose]
// app.get("/test-error", (req, res) => {
//     throw new ExpressError(500, "Test server error!");
// });

app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not found!!!!!!!!"));
});

app.use((err,req,res,next)=>{
    let {statusCode = 500,message= "something went wrong!!"} = err;
    res.status(statusCode).render("listings/error.ejs",{message});
});

// app.use((err,req,res,next)=>{
//     res.send("something went wrong!!");
// });

// app.get("/testListing",async (req,res)=>{
//     let sampleListing = new Listing({
//         title : "New villa",
//         description :"int the mountains",
//         price : 1200,
//         location : "Whimland orrico",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("scuccessful!!!");
// });
