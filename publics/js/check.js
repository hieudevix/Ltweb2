//ham bo 2 khoang trang
function doubleblank(str){
  var i = 0;
  var stmp1='', stmp2='';
  var lentmp = str.length;
  while(i < lentmp)	{
	stmp1 = str.charAt(i) + str.charAt(i+1);
	if (stmp1 != '  '){
	  stmp2 = stmp2 + str.charAt(i);
	}
	i++;
  }
  return stmp2;
}
function filterNum(str) {
	re = /^\$|,|\./g;	// remove "$" and "," and "."
	return str.replace(re, "");
}
function formatCurrency(num) {
	num = num.toString().replace(/\$|\,/g,'');
	if(isNaN(num))
		num = "0";
	sign = (num == (num = Math.abs(num)));
	num = Math.floor(num*100+0.50000000001);
	cents = num%100;
	num = Math.floor(num/100).toString();
	if(cents<10)
	cents = "0" + cents;
	for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
	num = num.substring(0,num.length-(4*i+3))+','+
	num.substring(num.length-(4*i+3));
	// return (((sign)?'':'-') + '$' + num + '.' + cents);
	return (((sign)?'':'-') + num );
}
function formatCurrency2(num) {
	num = num.toString().replace(/\$|\,/g,'');
	if(isNaN(num))
		num = "0";
	sign = (num == (num = Math.abs(num)));
	num = Math.floor(num*100+0.50000000001);
	cents = num%100;
	num = Math.floor(num/100).toString();
	if(cents<10)
	cents = "0" + cents;
	for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
	num = num.substring(0,num.length-(4*i+3))+','+
	num.substring(num.length-(4*i+3));
	// return (((sign)?'':'-') + '$' + num + '.' + cents);
	return (((sign)?'':'-') + num +'.'+cents);
}


function checkDesc(){
	if (event.keyCode==32 || event.keyCode==37 || event.keyCode==38 || event.keyCode==61 || event.keyCode==95 || (event.keyCode>=40 && event.keyCode<=57) || (event.keyCode>=65 && event.keyCode<=90) || (event.keyCode>=97 && event.keyCode<=122)) event.returnValue = true; 
	else event.returnValue = false;
}
function checkvn(s)
{
    var chuan="ABCDEFGHIJKLMNOPQRSTUVXYZW abcdefghijklmnopqrstuvxyzw0123456789/.,:;+-?(){}[]&%*|=\\'><";
    var i=0;
    var k=1;
    var l;
    var tam;
    while ((i<=s.length) && (k<=s.length))
    {
    tam = s.substring(i,k);
    if (chuan.indexOf(tam)==-1)
    {
     return 5;
    }
        i++;
        k++;
    }
    return 1;
}

function checkMaxLength(Object, MaxLen)
{
  return (Object.value.length <= MaxLen);
}
/***************************** check valid date *******************************/
var MONTH_NAMES=new Array('January','February','March','April','May','June','July','August','September','October','November','December','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
var DAY_NAMES=new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sun','Mon','Tue','Wed','Thu','Fri','Sat');

function isDate(val,format,code) {
	var date=getDateFromFormat(val,format,code);
  // alert(val + format)
	if (date==0) { return false; }
	return true;
}

function getDateFromFormat(val,format,code) {
	val=val+"";
	format=format+"";
	var i_val=0;
	var i_format=0;
	var c="";
	var token="";
	var token2="";
	var x,y;
	var now=new Date();
	var year=now.getUTCFullYear();
	var month=now.getUTCMonth()+1;
	var date=1;
	var hh=now.getUTCHours();
	var mm=now.getUTCMinutes();
	var ss=now.getUTCSeconds();
	var ampm="";

// //// hehe
var minYear = 1900;
var maxYear = 2100;
if (code == "b"){ // birthday, nguoi vay trong do tuoi 18-60
  minYear = year - 60;
  maxYear = year - 18;
}
if (code == "i"){ // issued day, cmnd ko qua 15 nam
  // minYear = year - 15 mam Dai bo check 07/01/2010
  maxYear = year
}

	while (i_format < format.length) {
		// Get next token from format string
		c=format.charAt(i_format);
		token="";
		while ((format.charAt(i_format)==c) && (i_format < format.length)) {
			token += format.charAt(i_format++);
			}
		// Extract contents of value based on format token
		if (token=="yyyy" || token=="yy" || token=="y") {
			if (token=="yyyy") { x=4;y=4; }
			if (token=="yy")   { x=2;y=2; }
			if (token=="y")    { x=2;y=4; }
			year=_getInt(val,i_val,x,y);
			if (year==null) { return 0; }
			i_val += year.length;
			if (year.length==2) {
				if (year > 70) { year=1900+(year-0); }
				else { year=2000+(year-0); }
      }
      /////// to them vao day hehe
      if (year < minYear || year > maxYear) { return 0; }
    }
		else if (token=="MMM"||token=="NNN"){
			month=0;
			for (var i=0; i<MONTH_NAMES.length; i++) {
				var month_name=MONTH_NAMES[i];
				if (val.substring(i_val,i_val+month_name.length).toLowerCase()==month_name.toLowerCase()) {
					if (token=="MMM"||(token=="NNN"&&i>11)) {
						month=i+1;
						if (month>12) { month -= 12; }
						i_val += month_name.length;
						break;
						}
					}
				}
			if ((month < 1)||(month>12)){return 0;}
			}
		else if (token=="EE"||token=="E"){
			for (var i=0; i<DAY_NAMES.length; i++) {
				var day_name=DAY_NAMES[i];
				if (val.substring(i_val,i_val+day_name.length).toLowerCase()==day_name.toLowerCase()) {
					i_val += day_name.length;
					break;
					}
				}
			}
		else if (token=="MM"||token=="M") {
			month=_getInt(val,i_val,token.length,2);
			if(month==null||(month<1)||(month>12)){return 0;}
			i_val+=month.length;}
		else if (token=="dd"||token=="d") {
			date=_getInt(val,i_val,token.length,2);
			if(date==null||(date<1)||(date>31)){return 0;}
			i_val+=date.length;}
		else if (token=="hh"||token=="h") {
			hh=_getInt(val,i_val,token.length,2);
			if(hh==null||(hh<1)||(hh>12)){return 0;}
			i_val+=hh.length;}
		else if (token=="HH"||token=="H") {
			hh=_getInt(val,i_val,token.length,2);
			if(hh==null||(hh<0)||(hh>23)){return 0;}
			i_val+=hh.length;}
		else if (token=="KK"||token=="K") {
			hh=_getInt(val,i_val,token.length,2);
			if(hh==null||(hh<0)||(hh>11)){return 0;}
			i_val+=hh.length;}
		else if (token=="kk"||token=="k") {
			hh=_getInt(val,i_val,token.length,2);
			if(hh==null||(hh<1)||(hh>24)){return 0;}
			i_val+=hh.length;hh--;}
		else if (token=="mm"||token=="m") {
			mm=_getInt(val,i_val,token.length,2);
			if(mm==null||(mm<0)||(mm>59)){return 0;}
			i_val+=mm.length;}
		else if (token=="ss"||token=="s") {
			ss=_getInt(val,i_val,token.length,2);
			if(ss==null||(ss<0)||(ss>59)){return 0;}
			i_val+=ss.length;}
		else if (token=="a") {
			if (val.substring(i_val,i_val+2).toLowerCase()=="am") {ampm="AM";}
			else if (val.substring(i_val,i_val+2).toLowerCase()=="pm") {ampm="PM";}
			else {return 0;}
			i_val+=2;}
		else {
			if (val.substring(i_val,i_val+token.length)!=token) {return 0;}
			else {i_val+=token.length;}
			}
		}
	// If there are any trailing characters left in the value, it doesn't match
	if (i_val != val.length) { return 0; }
	// Is date valid for month?
	if (month==2) {
		// Check for leap year
		if ( ( (year%4==0)&&(year%100 != 0) ) || (year%400==0) ) { // leap year
			if (date > 29){ return 0; }
			}
		else { if (date > 28) { return 0; } }
		}
	if ((month==4)||(month==6)||(month==9)||(month==11)) {
		if (date > 30) { return 0; }
		}
	// Correct hours value
	if (hh<12 && ampm=="PM") { hh=hh-0+12; }
	else if (hh>11 && ampm=="AM") { hh-=12; }
	var newdate=new Date(year,month-1,date,hh,mm,ss);
	return newdate.getTime();
}

function _isInteger(val) {
	var digits="1234567890";
	for (var i=0; i < val.length; i++) {
		if (digits.indexOf(val.charAt(i))==-1) { return false; }
		}
	return true;
}

function _getInt(str,i,minlength,maxlength) {
	for (var x=maxlength; x>=minlength; x--) {
		var token=str.substring(i,i+x);
		if (token.length < minlength) { return null; }
		if (_isInteger(token)) { return token; }
		}
	return null;
}

function DateFormat(vDateName, vDateValue, e, dateCheck, dateType) {
	//alert('asdfa');
	/*var whichCode = (window.Event) ? e.which : e.keyCode;
    if (whichCode == 8 || whichCode == 16 || whichCode == 39) //Ignore the Netscape value for backspace. IE has no value
		return false;
	else {
		var v = vDateName.value;
		//alert(v);
	    if (v.match(/^\d{2}$/) !== null) {
	    	vDateName.value = v + '/';
	    } else if (v.match(/^\d{2}\/\d{2}$/) !== null) {
	    	vDateName.value = v + '/';
	    }
	    return true;
	}*/
}
