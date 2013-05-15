//   MIT License
//   Copyright(c) 2013 Ezelia.com and other contributors
//   Author : Alaa-eddine KADDOURI (alaa.eddine@gmail.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of 
// this software and associated documentation files(the 'Software'), to deal in the 
// Software without restriction, including without limitation the rights to use, 
// copy, modify, merge, publish, distribute, sublicense, and / or sell copies of 
// the Software, and to permit persons to whom the Software is furnished to do so, 
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in 
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING  BUT NOT LIMITED  TO THE WARRANTIES  OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE 
// AUTHORS  OR COPYRIGHT HOLDERS BE LIABLE  FOR  ANY CLAIM,  DAMAGES OR OTHER 
// LIABILITY,  WHETHER IN AN ACTION OF CONTRACT,  TORT OR OTHERWISE,  ARISING 
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
// IN THE SOFTWARE.




var fs = require('fs');
var path = require('path');

var infile, outfile;



console.log(
'\n ts2haxe v0.1 - a TypeScript to Haxe converter.\n'+
' Author - Alaa-eddine KADDOURI\n'+
' \n');

var args = process.argv.slice(2);
var scriptName = 'node '+path.basename(__filename);
if (args.length == 0)
{	
	console.log(
	' usage      : '+scriptName+ ' inputfile <outputfile>\n\n'+
	' inputfile  : is the file you want to generate jsdoc for.\n'+
	' outputfile : (optional) the resulting file is sent to  outputfile, otherwise will overwrite inputfile .\n'+
	' \n'+
	' *Example :  '+scriptName+' myClass.ts');
	process.exit();
}
infile = args[0];
outfile = args[1] || infile+'.hx';


console.log(infile, ' => ', outfile);

var data = fs.readFileSync(infile, 'utf-8');


//List of TS reserved words (actually, they are JS reserved words)
var jsReservedWords = [
'abstract', 'else', 'instanceof', 'super', 
'boolean', 'enum', 'int', 'switch', 
'break', 'export', 'interface', 'synchronized', 
'byte', 'extends', 'let', 'this', 
'case', 'false', 'long', 'throw', 
'catch', 'final', 'native', 'throws', 
'char', 'finally', 'new', 'transient', 
'class', 'float', 'null', 'true', 
'const', 'for', 'package', 'try', 
'continue', 'function', 'private', 'typeof', 
'debugger', 'goto', 'protected', 'var', 
'default', 'if', 'public', 'void', 
'delete', 'implements', 'return', 'volatile', 
'do', 'import', 'short', 'while', 
'double', 'in', 'static', 'with'
];


var ts2hxTypes = {
'void'		:'Void', 
'number'	:'Float',
'int'		:'Int', 
'float'		:'Float', 
'bool'		:'Bool',
'string'	:'String',
'any'		:'Dynamic'
}
/*
var hxTypes = [
'Void', 
'Float', 
'Int', 
'Float', 
'Bool',
'String',
'Dynamic'
];
*/
function getCodeBlock(data, startIndex, open, close)
{
	var result='';
	var stack=[];
	for (var i=startIndex; i<data.length; i++)
	{	
		result+=data[i];
		if (data[i]==close)
		{
			stack.pop();
			if (stack.length <= 0 ) break;
			
		}
		if (data[i]==open) stack.push(i);
		
		
	}
	return result;
}

function convertNS(data)
{
	this.rootNS = true;
	var _this = this;
	var result = data;
	result = data.replace(/([\n\r\s]*)(export\s)*\s*module\s+([a-zA-Z_$][^{^}]+)([^{^}]*){/g, function() {
		var visibility = arguments[2] ? arguments[2].replace(/\s/g, '') : '';
		var ns = arguments[3].replace(/\s/g, '');
		console.log(' Namespace :  '+ns);
		
		if (_this.rootNS) 
		{
			_this.rootNS = false;
			return '\n\package '+ns+'/*#NS#*/';
		}
		else return '.'+ns+'/*#NS#*/';		
	});
	return result.replace('/*#NS#*/.', '.').replace('/*#NS#*/', ';\n');
}
function convertClass(data)
{
	this.rootNS = true;
	var _this = this;
	var result = data;
	result = data.replace(/([\n\r\s]*)(export|public\s)*\s*class\s+([a-zA-Z_$][^{^}]+)([^{^}]*){/g, function() {
		var indent = '\n'+arguments[1].replace(/(\r\n|\n|\r)/gm,""); //get original indentation
		var visibility = arguments[2] ? arguments[2].replace(/\s/g, '') : '';		
		var _class = arguments[3].replace(/\s/g, '');
		console.log(' Class :  '+_class);
		

		return indent+'class '+_class+' {';		
	});
	return result;
}
function convertFunctions(data)
{
	var result = data.replace(/([\n\r\s]*)(public\s|private\s|static\s)*\s*([a-zA-Z0-9_\$]+)\s*\((.*)\)([^{};]*){/g, function() {
		var original = arguments[0]; 
		var indent = '\n'+arguments[1].replace(/(\r\n|\n|\r)/gm,""); //get original indentation
		var visibility = arguments[2] || 'public '; //default to public
		var fnName = arguments[3]; //function name
		var params = arguments[4];
		var ret = arguments[5].replace(/\s/g, '').replace(':', '');
		
		var comment = original.match(/([\n\r\s]*)\/\/(.+)/g)
		if (comment) return original;
		
		
		//console.log(arguments);		
		if (jsReservedWords.indexOf(fnName) >= 0) return original;
		
		console.log(' Function :  ', fnName);
		
		if (fnName == 'constructor')
		{
			fnName = 'new';
			visibility = 'public ';
		}
		
		
		var args = '';
		if (params)
		{
			//parse function's parameters
			args = params.replace(/(public\s|private\s|static\s)*\s*([a-zA-Z_$][^:]+)\s*:\s*([a-zA-Z0-9_\$\[\]]+)\s*([^,]*)([\,]{0,1})/g, function() {
				var name = arguments[2].replace(/\s/g, '');
				if (name.indexOf('?') == name.length-1) name = '?'+name.substr(0, name.length-1);
				
				var type = arguments[3];
				if (ts2hxTypes[type]) type = ts2hxTypes[type];	
				//if (ts2hxTypes.indexOf(type) >= 0) type = hxTypes[tsTypes.indexOf(type)];
				
				var defValue = arguments[4];
				var sep = arguments[5];
				//console.log(arguments);
				//return indent+'* @param '+name + ' {'+type+'} \n';
				return name+':'+type+sep+' ';
			});  
		}
		
		
		//if (tsTypes.indexOf(ret) >= 0) ret = hxTypes[tsTypes.indexOf(ret)];
		if (ts2hxTypes[ret]) ret = ts2hxTypes[ret];
		
		if (ret) ret = ' : '+ret;
		ret += ' {';
		
		
		return '\n'+indent+visibility+'function '+fnName+'('+args+')'+ret;
		
	});
return result;
}

function convertVars(data)
{
	//FIXME : this regex will not match class variables if they are not prefixed with public/private;
	var result = data.replace(/([\n\r\s]*)(public\s|private\s|static\s)*([,:]*)\s*([a-zA-Z_$][^=:;,.{}\(\)]+)\s*:\s*([a-zA-Z_$\{\}\s\.][^=:;\(\)]*)\s*(\=[^;,:]*)*;/g, function() {
		var original = arguments[0];
		var indent = '\n'+arguments[1].replace(/(\r\n|\n|\r)/gm,""); //get original indentation
		var visibility = arguments[2]||'public '; //public / private
		var fakePositive = arguments[3]; //var name
		var varName = arguments[4]; //var name
		var varType = arguments[5]||'';
		var defVal = arguments[6];
		
		var comment = original.match(/([\n\r\s]*)\/\/(.+)/g)
		if (comment || fakePositive) return original;
		
		//console.log('*'+indent+'* ==> *'+varSep+'*');
		
		//console.log('* ',visibility, varName, varType,defVal);
		console.log(' Var : %s,  type= %s,  default value= %s',varName, varType, defVal);
  
		if (ts2hxTypes[varType]) varType = ts2hxTypes[varType];
		
		return indent+visibility+'var '+varName+' : '+varType+(defVal?defVal:'') + ';';
		
	});
	return result;
}

function convertForLoops(data)
{

	var indent='';
	var rePattern =/([\n\r\s]*)(\/\/.*)*for\s*\(([^;]*);([^;]*);([^{]*){/g
	//var matches = data.match(/([\n\r\s]*)for\s*\(([^;]*);([^;]*);([^{]*){/g);
	
	
	while (matches = rePattern.exec(data))
	{
		
		if (!matches || !matches[0]) continue;	
		
		//is it a comment ?  FIXME : find better way to detect comments
		var comment = matches[0].match(/([\n\r\s]*)\/\/(.+)/g)
		if (comment) continue;
	
		//console.log( matches[0]);
		
	
	
		var block = getCodeBlock(data, matches.index, '{', '}');
		var forblock = getCodeBlock(block, 0, '(', ')'); //need trim ?
	
	
		var init='';
		var cond='';
		var inc='';
		
		var status=0;
		var i=0;
		
		for (i=0; i<forblock.length; i++)
		{
			switch (status)
			{
				case 0:
					if (forblock[i]=='(') status++;
					break;
				case 1:  //For loop initialisation
					if (forblock[i]==';') status++;
					else init+=forblock[i];				
					break;
				case 2: //For loop stop condition
					if (forblock[i]==';') status++;
					else cond+=forblock[i];				
					break;
				case 3: //For loop incrementation
					//go to last index of ')'
					if (forblock[i]==')' && i >= forblock.lastIndexOf(')')) 
					{
						status++;
						continue;
					}
					
					inc+=forblock[i];				
					break;
			}
		}
	
		var indent = '\n'+matches[1].replace(/(\r\n|\n|\r)/gm,""); //get original indentation
		
		var whileBlock = '';
		whileBlock += indent+'// haxe does not support for loops with C/JS syntaxt ... unfolding : ';
		whileBlock += indent+'// '+forblock.replace(/(\r\n|\n|\r)/gm,"").replace(/(\s+)/gm," ");
		whileBlock += indent+init+';';
		whileBlock += indent+'while('+cond+') /*#FORLOOP#*//*#'+inc+'#*/';
			
		var newBlock = block.replace(forblock, whileBlock);
		

		
		data = data.substr(0, matches.index) + newBlock + data.substr(matches.index+block.length);

	}
	//data = data.replace(block, newBlock);
	
	
	
//	return data;
//	var result = data.replace(/([\n\r\s]*)for\s*\(([^;]*);([^;]*);([^{]*){/g, function() {
//		var original = arguments[0].replace(/(\r\n|\n|\r|\s)/gm,"");
//		indent = arguments[1].replace(/(\r\n|\n|\r)/gm,""); //get original indentation
//		var init = arguments[2]; //public / private
//		var cond = arguments[3]; //var name
//		var inc = arguments[4];
//		console.log('* ',arguments);
//		console.log(' *ForLoop %s|%s|%s',init, inc, cond);
  //
//		var r = '\n';
//		r += indent+'// haxe does not support for loop C/JS syntaxt unfolding : \n';
//		r += indent+'// '+original+'\n';
//		r += indent+init+';\n';
//		r += indent+'while('+cond+') { /*#FORLOOP#*//*#'+inc+'#*/';
//		return r;
//	});
	
	var result = data;
	while (result.indexOf('/*#FORLOOP#*/') > 0)
	{
		
		var stack=[];
		var start = result.indexOf('/*#FORLOOP#*/')
		result = result.substr(0, start)+result.substr(start+13, result.length);
		var curpos = 0;
		start+= 3; //start after /*#
		var inc='';
		var gotInc = false;
		for (var i=start; i<result.length; i++)
		{	
			if (inc.indexOf('#*/') < 0) inc += result[i];
			
			curpos = i;
			if (result[i]=='}')
			{
				stack.pop();
				if (stack.length <= 0 ) 
				{
					break;
				}				
			}
			if (result[i]=='{') stack.push(i);			
		}
		
		inc = inc.replace('#*/', ';\n');
		result = result.substr(0, curpos) + inc + indent+result.substr(curpos);
		result = result.substr(0, start-3)+result.substr(start+inc.length+1, result.length);
	}
	
	
	
	return result;
}




function convertTimers(data)
{
	//TODO : convert setTimer/setInterval
}

var data = convertVars(data);
data = convertForLoops(data);

data = convertFunctions(data);
data = convertClass(data);
data = convertNS(data);


//unfold TypeScript NS to Haxe Package
var result='';
var stack=[];
for (var i=0; i<data.length; i++)
{	
	if (data[i]=='}')
	{
		if (stack.length <= 0 ) continue;
		stack.pop();
	}
	if (data[i]=='{') stack.push(i);
	result+=data[i];
	
}

fs.writeFileSync(outfile, result);
console.log('done');
