



var curday = function(sp){
    today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //As January is 0.
    var yyyy = today.getFullYear();
    
    if(dd<10) dd='0'+dd;
    if(mm<10) mm='0'+mm;
    return (yyyy+sp+mm+sp+dd);
    };
    // console.log(curday('/'));
    // console.log(curday('-'));

module.exports = curday