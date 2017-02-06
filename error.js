(function(s){
"use strict";

s.error = null;

s.makeError = function() {
	s.error = [].slice.call(arguments, 0);
}
s.makeArityMismatchError = function(procedureName, args, isAtleast, expected, given) {
	s.makeError('arityMismatch', procedureName, args, isAtleast, expected, given);
}
s.wrongContract = function(procedureName, args, expected, given, argPosition) {
	s.makeError('contractViolation', procedureName, args, expected, given, argPosition);
}
s.makeIndexOutRangeError = function(procedureName, type, startIndex, endIndex, invalid, length, obj) {
	s.makeError('indexOutRange', procedureName, type, startIndex, endIndex, invalid, length, obj);
}

s.printError = function() {
	function printObjs(objs) {
		var values = [];
		objs.forEach(function(obj){
			var val = s.printObj(obj);
			if(val != null)
				values.push(val);
		});
		return values;
	}
	
	var error = s.error;
	var errorType = error[0];
	switch(errorType) {
	case 'arityMismatch':
		var procedureName = error[1];
		var argvs = error[2];
		var isAtleast = error[3];
		var expected = error[4];
		var given = error[5];
		var info = procedureName + ': ' + 'arity mismatch;';
		info += "\n  the expected number of arguments does not match the given number";
		info += "\n   expected: " + (isAtleast ? 'at least ' : '') + expected;
		info += "\n   given: " + given;
		if(argvs.length > 0)
			info += "\n   arguments: \n\t" + printObjs(argvs);
		break;
	case 'contractViolation':
		var procedureName = error[1];
		var argvs = error[2];
		var expected = error[3];
		var given = error[4];
		var argPosition = error[5] + 1;
		var info = procedureName + ': ' + 'contract violation;';
		info += "\n  expected: " + expected;
		info += "\n  given: " + s.printObj(given);
		info += "\n  argument position: " + argPosition + "st";
		info += "\n  arguments: \n\t" + printObjs(argvs);
		break;
	case "indexOutRange":
		var procedureName = error[1];
		var type = error[2];
		var startIndex = error[3];
		var endIndex = error[4];
		var invalid = error[5];
		var length = error[6];
		var obj = error[7];
		var info = procedureName + ": ";
		if(invalid == "index") {
			info += "index is out of range";
			if(length == 0) {
				info += " for empty " + type;
				info += "\n  index: " + startIndex;
			}
			else {
				info += "\n  index: " + startIndex;
				info += "\n  valid range: [0, " + (length - 1) + "]";
				info += "\n  " + type + ": " + s.printObj(obj);
			}
		}
		else {
			if(invalid == "starting") {
				info += "starting index is out of range";
				info += "\n  starting index: " + startIndex;
				info += "\n  valid range: [0, " + length + "]";
			}
			else if(invalid == "ending") {
				info += "ending index is out of range";
				info += "\n  ending index: " + endIndex;
				info += "\n  starting index: " + startIndex;
				info += "\n  valid range: [0, " + length + "]";
			}
			info += "\n  " + type + ": " + s.printObj(obj);
		}
		break;
	case 'undefined':
		var id = error[1];
		var info = id + ": undefined;";
		info += "\n cannot reference undefined identifier";
		break;
	default:
		info = error[0] + ": " + error[1];
	}
	s.console.value += info + "\n";
}
})(scheme);
