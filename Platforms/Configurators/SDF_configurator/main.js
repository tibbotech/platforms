//.............................................................................
function cleanArray(actual) {
	var newArray = new Array();
	var tempstr = new String;

	for (var i = 0; i < actual.length; i++) {
		if (actual[i]) {
			newArray.push(actual[i]);
		}
	}

	return newArray;
}
//.............................................................................
function Decode(Text) {
	var XText = new Array;
	var Lines = Text.split("\n");

	for (var i = 0; i < Lines.length; i++) {
		var j = Lines[i].indexOf("\r"); // get rid of \r
		var s = j == -1 ? Lines[i] : Lines[i].substr(0, j);
		if (s.substr(0, 2) == "I=") //|| i==0) //only read recoeds with leading chars ">>"
		{
			var Obj = ParseLine(s)
			if (Obj)
				XText.push(Obj);
		}
	}
	for (var i = 0; i < Lines.length; i++) {
		var j = Lines[i].indexOf("\r"); // get rid of \r
		var s = j == -1 ? Lines[i] : Lines[i].substr(0, j);
		if (s.substr(0, 1) == "#") //|| i==0) 
		{
			var Obj = ParseLine(s)
			if (Obj)
				XText.push(Obj);
		}
	}
	//XText.concat
	return XText;
}

function ParseLine(Line) {
	var Obj = new Object;
	var Properties = Line.split(";"); //save to array (TAB)
	var PropertyCount = 0;
	Properties = cleanArray(Properties); //incase many "Tab" keys amount fields, get rid of it.

	for (var i = 0; i < Properties.length; i++) {
		var s = Properties[i];     //every line
		var parts = s.split('=');
		var Name = parts[0];
		var Value = parts[1];
		if (parts.length > 2) {
			parts.shift();
			Value = parts.join('=');
		}
		if (Name == 'I') {
			Value = Value.replace('$', '');
		}

		Obj[Name] = Value;
		PropertyCount++;
	}
	

	if (!PropertyCount) // empty or ill-formatted line
		return null;

	// var Options = Obj.O ? ParseOptions(Obj.O) : null;
	// if (Options)
	// 	Obj.Options = Options;


	return Obj;
}

function ParseOptions(s) {
	var Options = new Array;

	var i = 0;
	for (; ;) {
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

function Encode(XText) {
	var Text = new String;

	for (var i = 0; i < XText.length; i++) {
		var s = FormatLine(XText[i]);
		Text += s;
		Text += "\r\n";
	}

	return Text;
}

function FormatLine(Obj) {
	//	Obj.O = Obj.Options ? FormatOptions(Obj.Options) : null;

	var s = new String;

	for (var Property in Obj) {
		var Value = Obj[Property];

		if (!Value) // this property is empty
			continue;

		s += Property + "=" + Value + ";";
	}

	return s;
}

if (typeof String.prototype.trim !== 'function') {
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$/g, '');
	}
}
//.............................................................................