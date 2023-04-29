const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejs = require("ejs");
const app = express();
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const UserCreds = require('./model/usercredentials')
const TourDetails = require('./model/tourdetails')
const Pricing = require('./model/pricing')




app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, "public")))
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/chologhuri", {useNewUrlParser: true});


passport.use(UserCreds.createStrategy());


passport.serializeUser(UserCreds.serializeUser())
passport.deserializeUser(UserCreds.deserializeUser())
app.set('views', path.join(__dirname, 'views'))
app.set('public', path.join(__dirname, 'public'))




app.get('/', (req, res) =>{
    if (req.isAuthenticated()) {
        res.render("loggedhome");
    } else {
        res.render("home");
    }
})

app.get("/packages", (req, res) =>{
    res.render("packages");
});
app.get("/aboutUs", (req, res) =>{
    res.render("about-us");
})
app.get('/review', (req, res) =>{
    res.render('review')

})



app.get("/contact", (req, res) =>{
    res.render("contact");
})
app.get('/registration', (req, res) =>{
    res.render('registration')
})

app.post('/registration', function (req, res) {
    UserCreds.register(new UserCreds({username: req.body.username, name: req.body.name, phone: req.body.phone, email: req.body.email, age: req.body.age, gender: req.body.gender, category: req.body.category }), req.body.password).then(function(user) {
        passport.authenticate("local")(req, res, function() {
            res.redirect("/");
        })
    }) .catch(function(err) {
        console.log(err);
        res.redirect("/registration")
    })
})

app.post("/login", function(req, res) {
    const user = new UserCreds({
        email: req.body.email,
        password: req.body.password
    })
    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/");
            })
        }
    })

})
app.get("/logout", function(req, res) {
    req.logout(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
})

app.get("/loggedbooking", (req, res) =>{
    if (req.isAuthenticated()) {
        res.render("loggedbooking");
    } else {
        res.redirect("/");
    }

});
app.get('/loggedreview', (req, res) =>{
    if (!req.session.user_id){
        res.render('autherror')
    }
    else {
        res.render('loggedreview')
    }


});
app.get('/wrong',(req, res) =>{
    res.render('wrongpass')
})


app.get('/loggedAboutUs', (req, res) =>{
    res.render("loggedAboutUs")

})
app.get('/loggedoffers', (req, res) =>{
    res.render("loggedoffers")

})
app.get('/loggedContactUs', (req, res) =>{
    res.render("loggedContactUs")

});


app.get('/profile', async (req, res) => {
    const profile = await UserCreds.findById(req.session.user_id)
    const fetchfname = profile.fname;
    const fetchlname = profile.lname;
    const fetchemail = profile.email;
    const fetchphone = profile.phone;
    const fetchdate = profile.age;
    const fetchgender = profile.gender;
    console.log(fetchfname, fetchlname, fetchemail, fetchphone, fetchdate,fetchgender)
    res.render('profile', {fetchfname, fetchlname, fetchemail, fetchphone, fetchdate,fetchgender})



});
app.get('/payment', async (req, res) => {
    console.log(req.session.user_id)
    const deets = await TourDetails.findById(req.session.user_id)
    const fetch = await Pricing.findOne({name:deets.hotel})
    const hotelprice = fetch.price;
    const fetchtrans = await Pricing.findOne({name:deets.transport})
    const transportprice = fetchtrans.price;
    const fetchvolunteer = await Pricing.findOne({name:deets.volunteer})
    const volunteerprice = fetchvolunteer.price;
    const fetchguest = deets.guests

    const total = (hotelprice+transportprice+volunteerprice+500)*fetchguest
    res.render('payment', {hotelprice,transportprice,volunteerprice,total,fetchguest})




});

app.post('/loggedthanks', async (req, res) =>{
    console.log(req.body.tour);
    const {from,to,guests,departure,arrival,hotel,transport,volunteer} = req.body.tour
    const tourdetail = new TourDetails({
        _id: req.session.user_id,
        from,
        to,
        guests,
        departure,
        arrival,
        hotel,
        transport,
        volunteer
    })
    await tourdetail.save()
    res.render('loggedthanks')
});

app.get('/autherror', (req, res) =>{
    res.render('autherror')
});









app.get('/logout', (req, res) =>{
    req.session.user_id = null;
    res.redirect('/')
});

app.use((req,res)=>{
    res.status(404).send('Not Found')
});
app.listen(3000, () =>{
    console.log('Service Port 3000')
});


