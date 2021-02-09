const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Entry = require('./tlentry')



const dateSchema = new Schema({
    date: String,
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    entries: [{type: Schema.Types.ObjectId, ref: 'Entry'}],
    
});

dateSchema.virtual('displaydate').get(function(){
    const days = this.date.split('-')
    const displaydate = `${days[1]}-${days[2]}-${days[0]}`
    return displaydate
 })


tlDate = mongoose.model('Tldates', dateSchema)

module.exports = tlDate



