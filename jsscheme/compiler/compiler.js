(function(scheme){
"use strict";

function compileSrcString(str) {
    var scmAsts = scheme.readMutil(str);
    var str = "";
    try {
        for(var i = 0; i < scmAsts.length; i++)
            str += compileAST(scmAsts[i]) + ";";
    } catch(e) {
    }
    return str;
}

function compileAST(exp) {
    if(exp == scheme.voidValue) {
        return genVoid(exp);
    }
    else if(isSelfEvaluating(exp)) {
        return genLiteral(exp);
    }
    else if(scheme.isSymbol(exp)) {
        return genRef(exp);
    }
    else if(scheme.isPair(exp)) {
        var first = scheme.car(exp);
        if(scheme.isSymbol(first)) {
            if(first == scheme.quoteSymbol) {
                return genQuotation(exp);
            }
            else if(first == scheme.assignmentSymbol) {
                return genAssignment(exp);
            }
            else if(first == scheme.defineSymbol) {
                return genDefinition(exp);
            }
            else if(first == scheme.ifSymbol) {
                return genIf(exp);
            }
            else if(first == scheme.lambdaSymbol) {
                return genLambda(exp);
            }
            else if(first == scheme.beginSymbol) {
                return genSequence(scheme.beginActions(exp));
            }
            else if(first == scheme.letSymbol) return compileAST(scheme.letToCombination(exp));
            else if(first == scheme.condSymbol) return compileAST(scheme.transformCond(exp));
            //else if(first == scheme.caseSymbol) return compileAST(scheme.transformCase(exp));
            else if(first == scheme.andSymbol) return genAnd(exp);
            else if(first == scheme.orSymbol) return genOr(exp);
            else if(first == scheme.whenSymbol) return compileAST(scheme.transformWhen(exp));
            else if(first == scheme.unlessSymbol) return compileAST(scheme.transformUnless(exp));
            else if(scheme.symbolVal(first) == "not") return genNot(exp);
            else if(scheme.symbolVal(first) == "+") return genPlus(exp);
            else if(scheme.symbolVal(first) == "-") return genMinus(exp);
            else if(scheme.symbolVal(first) == "*") return genMul(exp);
            else if(scheme.symbolVal(first) == "/") return genDiv(exp);
            else if(isCompOp(first)) return genCompOp(exp);
            //else if(first == scheme.doSymbol) return evaluate(scheme.transformDo(exp), env);
            //else if(first == scheme.whileSymbol) return evaluate(scheme.transformWhile(exp), env);
            //else if(first == scheme.forSymbol) return evaluate(scheme.transformFor(exp), env);
        }
        return genCall(exp);
    }
}

function isSelfEvaluating(exp) {
    return (scheme.isNumber(exp) || scheme.isChar(exp) || scheme.isString(exp) || scheme.isBoolean(exp));
}


// gen

function genVoid() {
    return "(void 0)";
}

function genLiteral(obj) {
    var str;
    if(scheme.isNumber(obj)) {
        str = obj.val;
    }
    else if(scheme.isChar(obj)) {
        str = "\"" + scheme.charVal(obj) + "\"";
    }
    else if(scheme.isString(obj)) {
        str = "\"" + scheme.stringVal(obj) + "\"";
    }
    else if(scheme.isBoolean(obj)) {
        str = obj.val ? "true" : "false";
    }
    else if(scheme.isSymbol(obj)) {
        str = "\"" + scheme.symbolVal(obj) + "\"";
    }
    else if(scheme.isEmptyList(obj)) {
        str = "[]";
    }
    else if(scheme.isPair(obj)) {
        if(scheme.isList(obj)) {
            return JSON.stringify(scheme.listToArray(obj).map(compileAST));
        }
    }
    return str;
}

function genRef(exp) {
    var str = scheme.symbolVal(exp);
    return str.replace(/->/, "_to_").replace(/-/g, "_").replace(/!/g, "");
}

function genQuotation(exp) {
    return genLiteral(scheme.quoteObject(exp));
}

function genAssignment(exp) {
    var id = compileAST(scheme.assignmentVar(exp));
    var val = compileAST(scheme.assignmentVal(exp));
    return id + " = " + val;
}

function genDefinition(exp) {
    var id = compileAST(scheme.definitionVar(exp));
    if(scheme.isSymbol(scheme.cadr(exp))) {
        var val = compileAST(scheme.definitionVal(exp));
        return "var " + id + " = " + val + ";";
    }
    else {
        var params = listOfValues(scheme.cdadr(exp)).join(",");
        var str = "function " + id + "(" + params + ")" + "{"
        str += " return" + genSequence(scheme.lambdaBody(exp));
        str += "\n}\n";
        return str;
    }
}

function genIf(exp) {
    var alt = scheme.ifAlternative(exp);
    return "(" + compileAST(scheme.ifPredicate(exp)) + " ? "
        + compileAST(scheme.ifConsequent(exp)) + " : "
        + (scheme.isEmptyList(alt) ? genVoid() : compileAST(alt))
        + ")";
}

function genCall(exp) {
    var func = compileAST(scheme.operator(exp));
    if(scheme.isPair(scheme.operator(exp)) && scheme.car(scheme.operator(exp)) == scheme.lambdaSymbol)
        func = "(" + func + ")";
    var args = listOfValues(scheme.operands(exp)).join(",");
    return func + "(" + args + ")";
}

function listOfValues(operands) {
    var values = [];
    while(!scheme.isEmptyList(operands)) {
        values.push(compileAST(scheme.car(operands)));
        operands = scheme.cdr(operands);
    }
    return values;
}

function genLambda(exp) {
    var formals = scheme.lambdaParamters(exp);
    var paramters = [];//参数数组
    var minArgs, maxArgs;
    if(scheme.isPair(formals)) {
        var isList = false;
        var listLen = 0;
        for(var obj = formals; !isList && scheme.isPair(obj); obj = scheme.cdr(obj)) {
            listLen++;
            paramters.push(scheme.car(obj));
            if(scheme.isEmptyList(scheme.car(obj)))
                isList = true;
        }
        if(!scheme.isEmptyList(obj))
            paramters.push(obj);
    }
    else if(scheme.isSymbol(formals)) {
        paramters.push(formals);
    }
    else if(scheme.isEmptyList(formals)) {
    }
    
    var str = "function(" + paramters.map(compileAST).join(", ") + ")" + " { \n";
    str += " return" + genSequence(scheme.lambdaBody(exp));
    str += "\n}";

    return str;
}

function genSequence(exps) {
    var strs = [];
    for(; !scheme.isEmptyList(exps); exps = scheme.cdr(exps))
        strs.push(compileAST(scheme.car(exps)));
    return "(function(){ " + strs.slice(0, strs.length - 1).join(";")
        + " return " + strs[strs.length - 1]
        + "})()";
}

function genAnd(exp) {
    return genInfixOp(exp, "&&");
}

function genOr(exp) {
    return genInfixOp(exp, "||");
}

function genNot(exp) {
    return genPrefixOp(exp, "!");
}

function genInfixOp(exp, op) {
    return "(" + scheme.mapList(compileAST, scheme.operands(exp), true).join(" " + op + " ") + ")";
}

function genPrefixOp(exp, op) {
    return "(" + op + compileAST(scheme.cadr(exp)) + ")";
}

function genPlus(exp) {
    var nums = scheme.listToArray(scheme.operands(exp));
    return nums.length == 1 ? genPrefixOp(exp) : genInfixOp(exp, "+");
}

function genMinus(exp) {
    var nums = scheme.listToArray(scheme.operands(exp));
    return nums.length == 1 ? genPrefixOp(exp) : genInfixOp(exp, "-");
}

function genMul(exp) {
    return genInfixOp(exp, "*");
}

function genDiv(exp) {
    return genInfixOp(exp, "/");
}

function isCompOp(sym) {
    return ["=","<",">","<=",">="].indexOf(scheme.symbolVal(sym)) > -1;
}

function genCompOp(exp) {
    var operator = scheme.symbolVal(scheme.operator(exp));
    if(operator == "=")
        operator = "==";
    var operands = scheme.listToArray(scheme.operands(exp));
    
    var pairs = [];
    for(var i = 0; i < operands.length - 1; i++) {
        pairs.push(compileAST(operands[i]) + operator + compileAST(operands[i + 1]));
    }
    return pairs.join(" && ");
}

scheme.compileSrcString = compileSrcString;

})(scheme);
