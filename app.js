const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const CholoGhuriPackage = require('./model/packages')
const UserCreds = require('./model/usercredentials')
const TourDetails = require('./model/tourdetails')
const Pricing = require('./model/pricing')


mongoose.connect('mongodb://127.0.0.1:27017/chologhuri');

const db = mongoose.connection;

db.on('error', console.error.bind(console,"connection error:"));
db.once('open', ()=>{
    console.log("Database Connected")
})


const app = express();
app.use(session({secret:'notagoodsecret'}))
app.use(express.static(path.join(__dirname, "public")))
app.set('views', path.join(__dirname, 'views'))
app.set('public', path.join(__dirname, 'public'))
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')


app.get('/', (req, res) =>{
    res.render('home')
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
app.post('/registersuccess', async(req, res) =>{
    const {fname, lname,email,phone,pass,confirmpass,age,category} = req.body.credentials
    const hash = await bcrypt.hash(pass, 12);
    const usercred = new UserCreds({
        fname,
        lname,
        email,
        phone,
        pass: hash,
        confirmpass,
        age:req.body.credentials.dateofbirth,
        category,
        gender: req.body.credentials.gender
    })
    await usercred.save();
    res.render('regsucces')
} );
app.post("/loginHome", async (req, res) =>{
    const {email, password} = req.body.login;
    const user = await UserCreds.findOne({email});
    const validity = await bcrypt.compare(password, user.pass);
    if (validity){
        req.session.user_id = user._id;
        res.render('loggedhome')
    }
    else {
        res.redirect("/wrong")
    }
});
app.get("/loggedbooking", (req, res) =>{
    if (!req.body.user_id){
        res.render('loggedbooking')
    }
    else {
        res.render('autherror')
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
app.get("/loginHome", async (req, res) =>{
    res.render('loggedhome')
})

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
app.listen(1417, () =>{
    console.log('Service Port 1417')
});


