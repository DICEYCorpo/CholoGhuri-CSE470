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
// const {isAuthenticated} = require("passport/lib/http/request");

const PayLater = require('./model/paylater')
const TempDetails = require('./model/tempdetails')


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
    UserCreds.register(new UserCreds({username: req.body.username, name: req.body.name, phone: req.body.phone, email: req.body.email, gender: req.body.gender,
        category: req.body.category, age: req.body.dateofbirth}), req.body.password).then(function(user) {
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
// app.post('/loggedbooking', (req, res) =>{
//     if (req.isAuthenticated()) {
//         const deets = new TourDetails({
//             username: req.user.username,
//             from: req.body.from,
//             to: req.body.to,
//             guests: req.body.guests,
//             departure: req.body.departure,
//             arrival: req.body.arrival,
//             hotel: req.body.hotel,
//             transport: req.body.transport,
//             volunteer: req.body.volunteer,
//             paid: false
//         })
//         deets.save().then(function () {
//             res.redirect("/payment");
//         }).catch(function (err) {
//             console.log(err);
//         })
//
//     } else {
//         res.redirect("/");
//     }
// })
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
    if(req.isAuthenticated()){
        UserCreds.findById(req.user._id).then(function (profile) {
            const fetchname = profile.name;
            const fetchemail = profile.email;
            const fetchphone = profile.phone;
            const fetchdate = profile.age;
            const fetchgender = profile.gender;
            console.log(fetchname, fetchemail, fetchphone, fetchdate,fetchgender)
            res.render('profile', {fetchname, fetchemail, fetchphone, fetchdate,fetchgender})
        }).catch(function (err) {
            console.log(err);
        })
    } else {
        res.redirect('/')
    }
});
// app.get('/payment', async (req, res) => {
//     try {
//         if (!req.isAuthenticated()) {
//             return res.redirect('/');
//         }
//         const user_id = await TourDetails.find({username: req.user.username}, { sort: { _id : -1 }})
//         const tourinfo = await TourDetails.findById(user_id[0]._id)
//         const name1 = tourinfo.hotel;
//         const fetchHotel = await Pricing.findOne({ name: name1 });
//         const hotelprice = fetchHotel.price;
//         const fetchTrans = await Pricing.findOne({ name: tourinfo.transport });
//         const transportprice = fetchTrans.price;
//         const fetchVolunteer = await Pricing.findOne({ name: tourinfo.volunteer });
//         const volunteerprice = fetchVolunteer.price;
//         const fetchguest = tourinfo.guests;
//         const total = (hotelprice + transportprice + volunteerprice + 500) * fetchguest;
//         console.log(fetchHotel,fetchguest)
//         res.render('payment', { hotelprice, transportprice, volunteerprice, total, fetchguest });
//     } catch (err) {
//         console.log(err);
//         res.status(500).send('Internal server error');
//     }
// });


app.post('/storetemp',  (req, res) =>{
    if (req.isAuthenticated()) {
        const tempdeets = new TempDetails({
            username: req.user.username,
            from: req.body.from,
            to: req.body.to,
            guests: req.body.guests,
            departure: req.body.departure,
            arrival: req.body.arrival,
            hotel: req.body.hotel,
            transport: req.body.transport,
            volunteer: req.body.volunteer,
            paid: false
        })
        tempdeets.save().then(function () {
            res.redirect("/payment");
        }).catch(function (err) {
            console.log(err);
        })
    } else {
        res.redirect('/')
    }

})
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



app.get('/editprofile', (req, res) =>{
    if (req.isAuthenticated()) {
        res.render('editProfile')
    } else {
        res.redirect('/')
    }
})

app.post("/editprofile", function(req, res) {
    UserCreds.findById(req.user._id).then(function (user) {
        user.email = req.body.newemail;
        user.name = req.body.newname
        user.save().then(function () {
            res.redirect("/profile");
        }).catch(function (err) {
            console.log(err);
        })

    }).catch(function (err) {
        console.log(err);
        res.redirect("/editprofile")
    })

})

app.get('/pending', (req, res) =>{
    try {
        if (!req.isAuthenticated()) {
            return res.redirect('/');
        }
        PayLater.find({username: req.user.username}).then(function (user) {
            res.render('pending', {user});
        })

    } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})

app.get('/payment', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }

    TempDetails.findOne({username: req.user.username}).then(async function (user) {
        // const tourinfo = await TempDetails.findById(user_id[0]._id)
        const fetchHotel = await Pricing.findOne({name: user.hotel});
        const hotelprice = fetchHotel.price;
        const fetchTrans = await Pricing.findOne({name: user.transport});
        const transportprice = fetchTrans.price;
        const fetchVolunteer = await Pricing.findOne({name: user.volunteer});
        const volunteerprice = fetchVolunteer.price;
        const fetchguest = user.guests;
        const total = (hotelprice + transportprice + volunteerprice + 500) * fetchguest;
        TempDetails.findById(user._id).then(function (user) {
            user.hotelprice = hotelprice;
            user.transportprice = transportprice;
            user.volunteerprice = volunteerprice;
            user.total = total;
            user.fetchguest = fetchguest
            user.save().then(function () {
                res.render('payment', {hotelprice, transportprice, volunteerprice, total, fetchguest});

            })
        })

    })
})
app.post("/paid", (req, res) =>{
    if (req.isAuthenticated()) {
        TempDetails.findOne({username: req.user.username}).then( function (user) {
            const later = new TourDetails({
                username: user.username,
                from: user.from,
                to: user.to,
                guests: user.guests,
                departure: user.departure,
                arrival: user.arrival,
                hotel: user.hotel,
                transport: user.transport,
                volunteer: user.volunteer,
                paid: false,
                hotelprice: user.hotelprice,
                transportprice: user.transportprice,
                volunteerprice: user.volunteerprice,
                total: user.total,
                fetchguest: user.fetchguest

            })
            later.save().then(function () {
                TempDetails.remove({}).then(function () {
                    console.log("TempDetails removed");
                })
                res.redirect("/");
            })
        })

    } else {
        res.redirect("/");
    }

})
app.post('/paylater', (req, res) =>{
    if (req.isAuthenticated()) {
        TempDetails.findOne({username: req.user.username}).then( function (user) {
            const later = new PayLater({
                username: user.username,
                from: user.from,
                to: user.to,
                guests: user.guests,
                departure: user.departure,
                arrival: user.arrival,
                hotel: user.hotel,
                transport: user.transport,
                volunteer: user.volunteer,
                paid: false,
                hotelprice: user.hotelprice,
                transportprice: user.transportprice,
                volunteerprice: user.volunteerprice,
                total: user.total,
                fetchguest: user.fetchguest

            })
            later.save().then(function () {
                TempDetails.remove({}).then(function () {
                    console.log("TempDetails removed");
                })
                res.redirect("/");
            })
        })

    } else {
        res.redirect("/");
    }
})

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


