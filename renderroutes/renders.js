const curday = require('../utilities/curdate')
const tlEntry = require('../models/tlentry');
const tlDate = require('../models/date');


module.exports.signup = (req, res) => {
    res.render('./pages/signup')}

module.exports.login = (req, res) => {
    res.render('./pages/login')}

module.exports.splashpage = (req, res) => {
    res.render('./pages/splashpage')}
    

module.exports.newentry = (req, res) => {
    day = curday('-')
    res.render('./pages/newentry', {day})}

module.exports.settings = function(req, res){
    res.render('./pages/settings')}

module.exports.home = async (req, res) => {
    const tldates = await tlDate.find({user: req.user._id}).populate('entries')
    tldates.sort(function (a, b) {
    var dateA = new Date(a.date), dateB = new Date(b.date)
    return dateA - dateB});
    res.render('./pages/home', {tldates})}

module.exports.specdatenewentry = async (req, res, next) => {
    const datetoadd = req.params.id
    day = curday('-')
    res.render('./pages/newdayentry', {datetoadd, day})}

module.exports.edit = async (req, res, next) => {
    const entry = await tlEntry.findById(req.params.id).populate("_id, tldate");
    res.render('./pages/editentry', {entry})}