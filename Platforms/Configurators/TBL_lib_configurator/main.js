
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
	var got_milk = new Boolean();      	//if have milk then	wahaha
	var XText = new Array;
	var cur_tbl_index=0;								//the index of current table record
	XText.TableSet = new Array;  				//Tables definitions
	XText.DefSet = new Array; 					//#define settings set
	got_milk=false;
	
	
	var Lines = Text.split("\n");
	for (var i = 0; i < Lines.length; i++)
	{
		var j = Lines[i].indexOf("\r"); 															// get rid of \r
		var s = j == -1 ? Lines[i] : Lines[i].substr(0, j);
		if (s.substr(0, 2)=="==") 																		//|| i==0) //only read recoeds with leading chars "=="
		{
				s=s.substr(2);
	      var Obj = ParseLine(s,1);
				if (!Obj) 																								// incase only '==' in the line.
				{
					var Obj = new Object;
					Obj.TBL_NAME='';
				}
				if (typeof(Obj.TBL_COMMENT)=='undefined')  Obj.TBL_COMMENT='';	//for comment(if null)
				XText.TableSet.push(Obj);
				var cur_tbl_index=XText.TableSet.length-1;                 //cur_tbl_index=the index of current table record 
				XText.TableSet[cur_tbl_index].FieldsDefnition = new Array; //declare child field definition for following field record
				got_milk=true;
		}
		else if (s.substr(0, 2)==">>")
		{
				if (got_milk==true)
				{
							s=s.substr(2);
				      var Obj = ParseLine(s,2);
							if (!Obj) 																						// incase only '==' in the line.
							{
								var Obj = new Object;
								Obj.FIELD_NAME='';
							} 
							if (typeof(Obj.FLD_COMMENT)=='undefined')  Obj.FLD_COMMENT='';	//for comment(if null)
							XText.TableSet[cur_tbl_index].FieldsDefnition.push(Obj);
							//got_child_flag=true; //have field definition
				}
		}
		else if (s.substr(0, 1)=="#")
		{
	      var Obj = ParseLine(s,0);
				if (Obj) 
				XText.DefSet.push(Obj);
		}
	}
	
	return XText;
}

function ParseLine(Line,Format)
{
	//Format=0-#,1-Table_Def,2-Field_Def
	var Obj = new Object;
  var Properties = Line.split("\x09"); 						//save to array (TAB)
	var PropertyCount = 0;
	Properties=cleanArray(Properties); 							//incase many "Tab" keys amount fields, get rid of it.

	
	for (var i = 0; i < Properties.length; i++)
	{	
		var s = Properties[i];     										//every line
		//(String(test7)
		if (s.substr(0, 1)!="#")
		{
				if (Format==1)
				{
					if (i > 4)  continue; //avoid extra fields
					if (i == 0) var Name = 'TBL_NAME';
					if (i == 1) var Name = 'MAX_RECS';
					if (i == 2) var Name = 'TBL_STRUCT';
					if (i == 3) var Name = 'NUM_KEY_FIELD';
					if (i == 4) var Name = 'TBL_COMMENT';
					var Value = s;
					Obj[Name] = Value;     
				}   
				if (Format==2)
				{
					if (i > 5)  continue; //avoid extra fields
					if (i == 0) var Name = 'FIELD_NAME';
					if (i == 1) var Name = 'FIELD_TYPE';
					if (i == 2) var Name = 'P1';
					if (i == 3) var Name = 'P2';
					if (i == 4) var Name = 'DEFVAL';
					if (i == 5) var Name = 'FLD_COMMENT';
					var Value = s;
					Obj[Name] = Value;     
				}         
		}
		else
		{
			if (i == 0) var Name = 'define_settings'; //#define setting
			
			var Value = s;
			Obj = Value;
		}
		
		PropertyCount++;
	}

	if (!PropertyCount) // empty or ill-formatted line
		return null;      //import, return null if empty
		
	return Obj;
}



//.............................................................................

function Encode(XText) 
{
	var Text = new String;


	for (var i = 0; i < XText.TableSet.length; i++) //oringinally, they are all in single object
	{	
			var s = FormatLine(XText.TableSet[i]); //1.save the line of current table record 
			Text += s;	Text += "\r\n";	
			if (!XText.TableSet[i].FieldsDefnition) continue;
			for (var j = 0; j < XText.TableSet[i].FieldsDefnition.length; j++) //2.save the lines of FieldsDefnition records which belong to current table record 
			{
					var s = FormatLine(XText.TableSet[i].FieldsDefnition[j]);
					Text += s;	Text += "\r\n";	
			}
	}
	
	for (var i = 0; i < XText.DefSet.length; i++) //3.save #define setting
	{	
			var s = XText.DefSet[i]; 
			Text += s;	Text += "\r\n";				
	}


	return Text;
}

function FormatLine(Obj)
{
	var s = new String;

	for (var Property in Obj)
	{
		if (Property == "FieldsDefnition") // skip this property to prevent adding extra fields in TableSet(135).
			continue;

		var Value = Obj[Property];

		if (!Value) // if property is empty then reume next
			continue;

		if (s.length != 0) 	s += "\x09";   //add tab, except first field

			
		if (Property == "TBL_NAME")
		{
				s += "=="+Value;
		}
		else if (Property == "FIELD_NAME")
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