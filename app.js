if(process.env.NODE_ENV != "production"){
    require("dotenv").config(); 
}

const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine('ejs', ejsMate);


//db connect
const dbUrl = process.env.ATLASDB_URL;
async function main() {
    await mongoose.connect(dbUrl);
}

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});


const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECERET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("ERROR in mongo session store", err);
});

const sessionOptions = {
    store,
    secret:process.env.SECERET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 1000  * 60 * 60 * 24 * 7,
        maxAge:1000  * 60 * 60 * 24 * 7,
        httpOnly:true
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// listing route
app.use("/listings",listingsRouter);

//reviews
app.use("/listings/:id/reviews",reviewsRouter);

//user
app.use("/",userRouter);

//error handling middlewares
app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Somethimg went Wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(port, () => {
    console.log("App listning at port 8080");
});

