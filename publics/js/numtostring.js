var mangso = ['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'];
function dochangchuc(so,daydu)
{
	var chuoi = "";
	chuc = Math.floor(so/10);
	donvi = so%10;
	if (chuc>1) {
		chuoi = " " + mangso[chuc] + " mươi";
		if (donvi==1) {
			chuoi += " mốt";
		}
	} else if (chuc==1) {
		chuoi = " mười";
		if (donvi==1) {
			chuoi += " một";
		}
	} else if (daydu && donvi>0) {
		chuoi = " lẻ";
	}
	if (donvi==5 && chuc>=1) {
		chuoi += " lăm";
	} else if (donvi>1||(donvi==1&&chuc==0)) {
		chuoi += " " + mangso[ donvi ];
	}
	return chuoi;
}
function docblock(so,daydu)
{
	var chuoi = "";
	tram = Math.floor(so/100);
	so = so%100;
	if (daydu || tram>0) {
		chuoi = " " + mangso[tram] + " trăm";
		chuoi += dochangchuc(so,true);
	} else {
		chuoi = dochangchuc(so,false);
	}
	return chuoi;
}
function dochangtrieu(so,daydu)
{
	var chuoi = "";
	trieu = Math.floor(so/1000000);
	so = so%1000000;
	if (trieu>0) {
		chuoi = docblock(trieu,daydu) + " triệu";
		daydu = true;
	}
	nghin = Math.floor(so/1000);
	so = so%1000;
	if (nghin>0) {
		chuoi += docblock(nghin,daydu) + " nghìn";
		daydu = true;
	}
	if (so>0) {
		chuoi += docblock(so,daydu);
	}
	return chuoi;
}
function docso(so)
{
        if (so==0) return ' ' + mangso[0];
	var chuoi = "", hauto = "";
	do {
		ty = so%1000000000;
		so = Math.floor(so/1000000000);
		if (so>0) {
			chuoi = dochangtrieu(ty,true) + hauto + chuoi;
		} else {
			chuoi = dochangtrieu(ty,false) + hauto + chuoi;
		}
		hauto = " tỷ";
	} while (so>0);
	return chuoi;
}

var th = ['','thousand','million', 'billion','trillion'];

var dg = ['zero','one','two','three','four', 'five','six','seven','eight','nine']; 

var tn = ['ten','eleven','twelve','thirteen', 'fourteen','fifteen','sixteen', 'seventeen','eighteen','nineteen'];

var tw = ['twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety']; 


function num2words(s)

{  
	
    s = s.toString(); 

    s = s.replace(/[\, ]/g,''); 

    if (s==0 || s=='') 
    {
    	return 'zero '; 
    }
    
    if (s != parseFloat(s)) return 'not a number'; 
     
    var x = s.indexOf('.'); 

    if (x == -1) x = s.length; 

    if (x > 15) return 'too big'; 

    var n = s.split(''); 
    
    var str = ''; 

    var sk = 0; 

    for (var i=0; i < x; i++) 

    {

        if ((x-i)%3==2) 

        {

            if (n[i] == '1') 

            {

                str += tn[Number(n[i+1])] + ' '; 

                i++; 

                sk=1;

            }

            else if (n[i]!=0) 

            {

                str += tw[n[i]-2] + ' ';

                sk=1;

            }

        }

        else if (n[i]!=0) 

        {

            str += dg[n[i]] +' '; 

            if ((x-i)%3==0) str += 'hundred ';

            sk=1;

        }

        if ((x-i)%3==1)

        {

            if (sk) str += th[(x-i-1)/3] + ' ';

            sk=0;

        }

    }

    if (x != s.length)

    {

        var y = s.length; 

        str += 'point '; 

        for (var i=x+1; i<y; i++) str += dg[n[i]] +' ';

    }

    return str.replace(/\s+/g,' ');

}