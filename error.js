(function(s){
"use strict";

s.error = null;

s.restError = function() { s.error = null; }

s.Error = function(objs) {
    this.objs = objs;
}

s.makeError = function() {
    s.error = new s.Error([].slice.call(arguments, 0));
    throw s.error;
}

s.arityMismatchError = function(procedureName, args, isAtleast, expected, given) {
    s.makeError('arityMismatch', procedureName, args, isAtleast, expected, given);
}

s.wrongContract = function(procedureName, expected, index, argv) {
    s.makeError('contractViolation', procedureName, expected, index, argv);
}

s.indexOutRangeError = function(procedureName, type, startIndex, endIndex, invalid, length, obj) {
    s.makeError('indexOutRange', procedureName, type, startIndex, endIndex, invalid, length, obj);
}

s.outputError = function() {
    function getMutilLineArgStr(objs) {
        var str = "";
        objs.forEach(function(obj){
            str += "\n   " + s.displayToString(obj);
        });
        return str;
    }
    
    var error = s.error.objs;
    var errorType = error[0];
    switch(errorType) {
    case 'arityMismatch':
        var procedureName = error[1];
        var argv = error[2];
        var isAtleast = error[3];
        var expected = error[4];
        var given = error[5];
        var info = procedureName + ': ' + 'arity mismatch;';
        info += "\n  the expected number of arguments does not match the given number";
        info += "\n  expected: " + (isAtleast ? 'at least ' : '') + expected;
        info += "\n  given: " + given;
        if(argv.length > 0)
            info += "\n  arguments...:" + getMutilLineArgStr(argv);
        break;
    case 'contractViolation':
        var procedureName = error[1];
        var expected = error[2];
        var index = error[3];
        var argv = error[4];
        var given = argv[index];
        var info = procedureName + ': ' + 'contract violation';
        info += "\n  expected: " + expected;
        info += "\n  given: " + s.writeToString(given);
        if(argv.length > 1) {
            info += "\n  argument position: " + (index + 1);
            var otherArgs = argv.filter(function(a,i){ return i != index; });
            info += "\n  other arguments...:" + getMutilLineArgStr(otherArgs);
        }
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
                info += "\n  " + type + ": " + s.writeToString(obj);
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
            info += "\n  " + type + ": " + s.writeToString(obj);
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
    s.outputLineToConsole(info);
}
})(scheme);
