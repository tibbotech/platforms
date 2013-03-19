
//.............................................................................
function cleanArray(actual){
  var newArray = new Array();
  var tempstr=new String;
  
  for(var i = 0; i<actual.length; i++){
      if (actual[i]){
        newArray.push(actual[i]);
    }
  }
  	
  return newArray;
}
//.............................................................................
function Decode(Text)
{       	
	var XText = new Array;
	var Lines = Text.split("\n");

	for (var i = 0; i < Lines.length; i++)
	{
		var j = Lines[i].indexOf("\r"); // get rid of \r
		var s = j == -1 ? Lines[i] : Lines[i].substr(0, j);
		if (s.substr(0, 2)==">>") //|| i==0) //only read recoeds with leading chars ">>"
		{
				s=s.substr(2);
	      var Obj = ParseLine(s)
				if (Obj) 
				XText.push(Obj);
		}
	}
	for (var i = 0; i < Lines.length; i++)
	{
		var j = Lines[i].indexOf("\r"); // get rid of \r
		var s = j == -1 ? Lines[i] : Lines[i].substr(0, j);
		if (s.substr(0, 1)=="#") //|| i==0) 
		{
	      var Obj = ParseLine(s)
				if (Obj) 
				XText.push(Obj);
		}
	}
	//XText.concat
	return XText;
}

function ParseLine(Line)
{
	var Obj = new Object;
  var Properties = Line.split("\x09"); //save to array (TAB)
	var PropertyCount = 0;
	Properties=cleanArray(Properties); //incase many "Tab" keys amount fields, get rid of it.

	
	for (var i = 0; i < Properties.length; i++)
	{	
		var s = Properties[i];     //every line
		//(String(test7)
		if (s.substr(0, 1)!="#")
		{
			if (i == 0) var Name = 'NAME';
			if (i == 1) var Name = 'STORAGE';
			if (i == 2) var Name = 'TYPE';
			if (i == 3) var Name = 'MEMBER';
			if (i == 4) var Name = 'P1';
			if (i == 5) var Name = 'P2';
			if (i == 6) var Name = 'INI';
			if (i == 7) var Name = 'DEFVAL';	
			if (i == 8) var Name = 'C';
		}
		else
		{
			if (i == 0) var Name = 'CONFIG'; //#define setting
		}
		
		var Value = s;
		
		Obj[Name] = Value;
		PropertyCount++;
	}

	if (!PropertyCount) // empty or ill-formatted line
		return null;

	var Options = Obj.O ? ParseOptions(Obj.O) : null;
	if (Options)
		Obj.Options = Options;
		

	return Obj;
}

function ParseOptions(s)
{
	var Options = new Array;

	var i = 0;
	for (;;)
	{
		var j = s.indexOf("/", i);
		if (j == -1) 
			break; // invalid option

		var Name = s.slice(i, j);
		
		i = j + 1;
		j = s.indexOf("/", i);      //pharse members?
		
		var Value = j != -1 ? s.slice(i, j) : s.slice(i);

		var Option = new Object;
		Option.Name = Name;
		Option.Value = Value;
		Options.push(Option);


		if (j == -1)
			break; // no more options
			
		i = j + 1;
	}

	if (!Options.length) // ill-formatted option string
		return null;

	return Options;
}

//.............................................................................

function Encode(XText) 
{
	var Text = new String;

	for (var i = 0; i < XText.length; i++)
	{
		var s = FormatLine(XText[i]);
		Text += s;
		Text += "\r\n";
	}

	return Text;
}

function FormatLine(Obj)
{
//	Obj.O = Obj.Options ? FormatOptions(Obj.Options) : null;

	var s = new String;

	for (var Property in Obj)
	{
		if (Property == "Options") // skip this property, it's already formatted into Obj.O
			continue;

		var Value = Obj[Property];

		if (!Value) // this property is empty
			continue;

		if (s.length != 0) 
			s += "\x09";   //<<<<<<<<<<<<<<<<<<

		//s += Property;
		//s += "=";
			
		if (Property == "NAME")
		{
				s += ">>"+Value;
		}
		else
		{
				s += Value;
		}
	}
	
	return s;
}

//.............................................................................