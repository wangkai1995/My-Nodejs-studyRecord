Date.prototype.format = function(format,date){
    if(!format || typeof format !== 'string'){
    throw new Error('format is undefiend or type is Error');
  }
  date = date instanceof Date? date : (typeof date === 'number'|| typeof date === 'string')? new Date(date): new Date();
  var formatReg = {
    'y+': date.getFullYear(),
    'M+': date.getMonth()+1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for(reg in formatReg){
    if(new RegExp(reg).test(format)){
            var match = RegExp.lastMatch;
        format = format.replace(match, formatReg[reg].toString().slice(-match.length) );
    }
  }
  return format;
}

console.log( Date.prototype.format('yyyy-MM-dd hh:mm:ss', new Date('2015-11-11 12:15:23') ) );