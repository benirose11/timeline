const User = require('../models/user');
const tlEntry = require('../models/tlentry');
const tlDate = require('../models/date');
const multer  = require('multer');
const {storage, cloudinary} = require('../cloudinary')


module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Logged out')
    res.redirect('/home')}

module.exports.register = async (req, res, next)=>{
    try {
        const {email, username, password} = req.body
        const newuser = await new User({email, username})
        const registereduser = await User.register(newuser, password);
        req.login(registereduser, err => {
            if(err) return next(err)
        });
        req.flash('success', 'Welcome to Timeline')
        res.redirect('/home')
        }
        catch(e){
            req.flash('error', e.message)
            res.redirect('/register')
        }}

module.exports.login = (req, res)=>{
    req.flash('success', 'Logged in');
    const targeturl = req.session.returnto || '/home';
    delete req.session.returnto;        
    res.redirect(targeturl)}

module.exports.edit = async (req, res) => {
    const { id } = req.params;
    const targetdate = req.body.tldate;
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
    const olddate = await tlDate.findOne({'entries':`${id}`})
    if (olddate.date === targetdate){
        req.body.tldate = olddate._id
        const updated = await tlEntry.findByIdAndUpdate(id, { ...req.body });
        await updated.images.push(...imgs);
        if(req.body.deleteImages){
            for(filename of req.body.deleteImages){await cloudinary.uploader.destroy(filename)}
            await updated.updateOne({$pull:{images: {filename:{$in: req.body.deleteImages}}}})}
        updated.save();} 
    else {
    const tlid = await tlDate.findOne({'date':`${targetdate}`});
    olddate.entries.pull(id);
    olddate.save(); 
    if (tlid) {
        req.body.tldate = tlid._id;
        tlid.entries.push(id);
        tlid.save()
        }
        else {
            const newdate = new tlDate;
            newdate.date = req.body.tldate;
            newdate.user = req.user._id
            req.body.tldate = newdate._id;
            newdate.entries.push(id)
            newdate.save(); 
            };  
    const updated = await tlEntry.findByIdAndUpdate(id, { ...req.body });
    await updated.images.push(...imgs);
    if(req.body.deleteImages){
        for(filename of req.body.deleteImages){await cloudinary.uploader.destroy(filename)}
    await updated.updateOne({$pull:{images: {filename:{$in: req.body.deleteImages}}}})
            }
    updated.save();}
    if(olddate.entries.length === 0){await tlDate.findByIdAndDelete(olddate._id)}
    res.redirect('/home')}

module.exports.deleteEntry = async (req, res, next) => {
    deleted = await tlEntry.findByIdAndDelete(req.params.id);
    for(img of deleted.images){await cloudinary.uploader.destroy(img.filename)}
    res.redirect('/home')}

module.exports.deleteDate = async (req, res, next) => {
    const deleted = await tlDate.findByIdAndDelete(req.params.id).populate({
        path: 'entries',
        populate: {path: 'images'}
    });
    for(entry of deleted.entries){
        for(img of entry.images){
            await cloudinary.uploader.destroy(img.filename)}}
    await tlEntry.deleteMany({_id:{$in: deleted.entries}})
    res.redirect('/home')}   

module.exports.new = async (req, res, next) => {
    const searchdate = await tlDate.findOne({date: req.body.tldate, user: req.user._id });
    const images = req.files.map(f => ({url: f.path, filename: f.filename}))
    if (!searchdate) {
        console.log('making new')
        const newtldate = new tlDate();
        const newtlentry = new tlEntry();
        newtldate.entries = newtlentry._id;
        newtldate.user = req.user._id
        newtlentry.tldate = newtldate._id;
        newtldate.date = req.body.tldate;
        newtlentry.title = req.body.title;
        newtlentry.body = req.body.body;
        newtlentry.entrydate = req.body.entrydate;
        for(img of images){newtlentry.images.push(img)};
        await newtldate.save();
        await newtlentry.save()
        console.log(newtldate, newtlentry)
        } else { 
            console.log('working with existing')
            const newtlentry = new tlEntry();
            searchdate.entries.push(newtlentry._id)
            newtlentry.tldate = searchdate._id;
            newtlentry.title = req.body.title;
            newtlentry.body = req.body.body;
            newtlentry.entrydate = req.body.entrydate;
            for(img of images){newtlentry.images.push(img)};
            await newtlentry.save()
            await searchdate.save()
            console.log(searchdate, newtlentry)}
// console.log('searchdate', searchdate, req.user._id, req.body)
res.redirect(`/home`)}