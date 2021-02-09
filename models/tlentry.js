const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Tldate = require('./date')

const imgSchema = new Schema({ url: String,
    filename: String})

imgSchema.virtual('thumbnail').get(function(){
   return this.url.replace('/upload', '/upload/c_fit,g_center,h_200,w_200,x_22')
})

const tlSchema = new Schema({
    title: String,
    body: String,
    tldate: {type: Schema.Types.ObjectId, ref: 'Tldates'},
    entrydate: String,
    images: [imgSchema]
    
});


tlSchema.virtual('displayentrydate').get(function(){
    const days = this.entrydate.split('-')
    const displaydate = `${days[1]}-${days[2]}-${days[0]}`
    return displaydate
 })




const tlEntry =  mongoose.model('Entry', tlSchema)

module.exports = tlEntry
