const mongoose = require('mongoose');
const tlEntry = require('../models/tlentry');
const tlDate = require('../models/date');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/timeline';


mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,

});
const db = mongoose.connection
.then(()=>{console.log("connection open from inside seeds")})
.catch(err => {console.log("oh no, error");console.log(err)})




const seedDB = async () => {
    await tlEntry.deleteMany({});
    await tlDate.deleteMany({});
    for(let i = 0; i < 5; i++){
        const newtldate = new tlDate();
        const newtlentry = new tlEntry();
        newtldate.entries = newtlentry._id;
        newtlentry.tldate = newtldate._id;
        newtldate.date = `${1000 + i}-01-11`;
        newtldate.user = '600a6ae4f0d30f09a16a7d91',
        newtlentry.title = `Seeded Title #${i}`;
        newtlentry.body = `Seeded Body #${i}`;
        newtlentry.entrydate = `${1200 + i}-01-11`;
        newtlentry.images = [{url: 'https://res.cloudinary.com/dguuftkii/image/upload/v1612835738/Default%20Images/Pomeranian-GettyImages-1014940472-a6ba0030958a4bbba0eee3e982ee9bc6_epwqid.jpg', filename: 'pomeranian'}]
        await newtldate.save();
        await newtlentry.save()}
    
}

module.exports.seedDB = function(){
    seedDB();
    console.log('Database Seeded')
}

module.exports.clearDB =  async () => {
    await tlDate.deleteMany({});
    await tlEntry.deleteMany({});
    console.log('deleted dates');}
