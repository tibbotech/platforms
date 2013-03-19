
//.............................................................................

//global flag
var info_count=new Number;
var	got_milk=false;
function cleanArray(actual)
{
  var newArray = new Array();
  var tempstr=new String;
  for(var i = 0; i<actual.length; i++)
  {
      if (actual[i])
      {
        newArray.push(actual[i]);
    	}
  }	
  return newArray;
}
//.............................................................................
function Decode(Text)
{ 
	var got_milk = new Boolean();      	  //if have milk then	wahaha
	var XText = new Array;								//the XTXT
	var cur_entity_index=0;								//the index of current table record
	XText.EntitySet = new Array;  				//Aggregate definition set
	XText.DefSet = new Array; 					  //#define settings set
	XText.STG_RefPath= '';								//Reference source. STG
	XText.TBL_RefPath= '';								//Reference source. TBL
	got_milk=false;
	
	
	
	var Lines = Text.split("\n");
	for (var i = 0; i < Lines.length; i++)
	{
		var j = Lines[i].indexOf("\r"); 																						
		var s = j == -1 ? Lines[i] : Lines[i].substr(0, j);
		if (s.substr(0, 2)=="==")       																						
		{
				//we declare child object for the following children records first in this case, cuz we may add child in ParseLine.
				var tmp_obj = new Object;
				tmp_obj.Necessary_Script_Set = new Array; 
				tmp_obj.Customize_Script_Set = new Array
				XText.EntitySet.push(tmp_obj);
				var cur_entity_index=XText.EntitySet.length-1;                       		//current record 

				info_count=0; 																													//for info Mainly, and must before ParseLine.(read only one record)
				
				s=s.substr(2);
	      var Obj = ParseLine(s,1,XText.EntitySet[cur_entity_index]);
				if (!Obj) 																															//incase only '==' in the line.
				{
					var Obj = new Object;
					Obj.ENTITY_NAME='';
				}

				//only read "info", "variables", "functions", or "events" for now.
				switch (Obj.ENTITY_NAME) 
				{
						case 'info':
						case 'variables':
						case 'functions':
						case 'events':
							break;
						default:
							got_milk=false;
							XText.EntitySet.splice(cur_entity_index,1);												 //remove the entity we don't want
							var cur_entity_index=XText.EntitySet.length-1;                     //recycle current record 
							continue;
				}
				//push data - we don't use push object method directly, cuz we have already put somthing in the object(children declare).
				XText.EntitySet[cur_entity_index].ENTITY_NAME=Obj.ENTITY_NAME;															 //XText.EntitySet.push(Obj); 
				if (Obj.CONTEXT_LAYER === 'undefined')
				Obj.CONTEXT_LAYER='root';
				XText.EntitySet[cur_entity_index].CONTEXT_LAYER=Obj.CONTEXT_LAYER;

				//set ok flag
				got_milk=true;
				if((Obj.ENTITY_NAME=='info')&&(info_count>0)){got_milk=false}; //for info
		}
		else if (s.substr(0, 2)=="~~")
		{
				info_count+=1;
				//Necessary_Script_Set
				if (got_milk==true)
				{
							s=s.substr(2);
				      var Obj = ParseLine(s,2);
							if (!Obj) 																						
							{
								var Obj = new Object;
								Obj.SCRIPT='';
							} 
							XText.EntitySet[cur_entity_index].Necessary_Script_Set.push(Obj);
				}
		}
		else if (s.substr(0, 2)==">>")
		{
				//Customize_Script_Set
				if(XText.EntitySet[cur_entity_index].ENTITY_NAME=='info') {got_milk=false}; //for info
				if (got_milk==true)
				{
							s=s.substr(2);
				      var Obj = ParseLine(s,3,XText.EntitySet[cur_entity_index]);
							if (!Obj) 																						
							{
								var Obj = new Object;
								Obj.VAR_NAME='';
							} 
							XText.EntitySet[cur_entity_index].Customize_Script_Set.push(Obj);
				}
		}
		else if (s.substr(0, 1)=="#")
		{
	      var Obj = ParseLine(s,0);
				if (Obj) 
				XText.DefSet.push(Obj);
		}
		else if (s.substr(0,14)=="@@STG_RefPath=")
		{
				s=s.substr(14);
				XText.STG_RefPath=s;
		}
		else if (s.substr(0,14)=="@@TBL_RefPath=")
		{
				s=s.substr(14);
				XText.TBL_RefPath=s;
		}
	}
	return XText;
}

function ParseLine(Line,Format,EntitySet)
{
	//Format=0-#Define, 1-Entity def, 2-NecessaryScript def, 3-Customize_Script_Set, 4-reference path name
	
	var Obj = new Object;
  var Properties = Line.split("\x09"); 						//save to array (TAB)
	var PropertyCount = 0;
	Properties=cleanArray(Properties); 							//incase many "Tab" keys amount fields, get rid of it.

	
	for (var i = 0; i < Properties.length; i++)
	{	
		var s = Properties[i];     										//every line

				if (Format==1)
				{
					if (i > 2)  continue; 									//avoid extra fields
					if (i == 0) var Name = 'ENTITY_NAME';
					if (i == 1) var Name = 'CONTEXT_LAYER';
					if (i == 2)
					{
						//Agg_lib will take the third field  as a single record, and the record is the same to the record with leading characters "~~".
						//process "Necessary_Script" here(script after the entity line)
							info_count+=1;
				      var third_Obj = ParseLine(s,2);		// Recursive(only for "the third field")
							if (!third_Obj) 									// Prevent null object
							{
								var third_Obj = new Object;
								third_Obj.SCRIPT='';
							}
							EntitySet.Necessary_Script_Set.push(third_Obj);
							continue;
					}
					var Value = s;
					Obj[Name] = Value;
				}
				if (Format==2)
				{
					if (i > 0)  continue; 			//avoid pushing extra fields we don't need.
					if (i == 0) var Name = 'N_SCRIPT';
					var Value = s;
					Obj[Name] = Value;
				}
				if (Format==3)
				{
						if(EntitySet.ENTITY_NAME=='functions')
						{
								if (i > 1)  continue; 
								if (i == 0) var Name = 'VAR_NAME';
								if (i == 1) var Name = 'C_SCRIPT';
								var Value = s;
								Obj[Name] = Value;
						}
						else
						{
								if (i > 2)  continue; 
								if (i == 0) var Name = 'VAR_NAME';
								if (i == 1) var Name = 'VAR_TYPE';
								if (i == 2) var Name = 'C_SCRIPT';
								var Value = s;
								Obj[Name] = Value;							
						}
				}
				if (Format==0)
				{//the Set of "#define "
						var Value = s;
						Obj = Value;
				}
		
		PropertyCount++;
	}

	if (!PropertyCount) // empty or ill-formatted line
		return null;      // important, return null if empty
	return Obj;
}



//.............................................................................

function Encode(XText) 
{
	var Text = new String;


	for (var i = 0; i < XText.EntitySet.length; i++)
	{	
			var s = FormatLine(XText.EntitySet[i]); 																 //1.save the line of current table record 
			//for third field
			if (XText.EntitySet[i].Necessary_Script_Set.length!=0)
			{
				Text += s;	Text +="\x09";
				var format_flag=1;
			}
			else
			{
				Text += s;	Text +="\r\n";
			}
			
			
			//if (!XText.EntitySet[i].Necessary_Script_Set) continue; //In this case, it seems we don't need this line here.

			for (var j = 0; j < XText.EntitySet[i].Necessary_Script_Set.length; j++) //2.save the lines of child records which belong to current parent record 
			{
					var s = FormatLine(XText.EntitySet[i].Necessary_Script_Set[j],format_flag);
					Text += s;	Text += "\r\n";	
					var format_flag=2;
			}
			for (var k = 0; k < XText.EntitySet[i].Customize_Script_Set.length; k++) 
			{
					var s = FormatLine(XText.EntitySet[i].Customize_Script_Set[k],format_flag);
					Text += s;	Text += "\r\n";	
			}			
	}
	
	for (var i = 0; i < XText.DefSet.length; i++) //3.save #define setting
	{	
			var s = XText.DefSet[i]; 
			Text += s;	Text += "\r\n";				
	}
	
	//final
	var s = XText.STG_RefPath; 
	Text+="@@STG_RefPath="+s+"\r\n";		
	var s = XText.TBL_RefPath; 
	Text+="@@TBL_RefPath="+s+"\r\n";		

	return Text;
}

function FormatLine(Obj,n_flag)
{
	//n_flag=1-put data in third field, 2-indepent
	var s = new String;

	for (var Property in Obj)
	{
		if ((Property == "Necessary_Script_Set")||(Property == "Customize_Script_Set")) // skip this property to prevent adding extra fields in EntitySet(for the first layer).
			continue;

		var Value = Obj[Property];

		if (!Value) 												// if property is empty then reume next
			continue;

		if (s.length != 0) 	s += "\x09";   	//add tab, except first field

			
		if (Property == "ENTITY_NAME")
		{
				s += "=="+Value;
		}
		else if (Property == "N_SCRIPT")
		{
				if (n_flag==2)
				{
					s += "~~"+Value;
				}
				else 
				{
					s += Value;
				}
		}
		else if (Property == "VAR_NAME")
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