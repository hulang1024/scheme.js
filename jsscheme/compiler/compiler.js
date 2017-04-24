(function(s){
"use strict";

function compileSrcString(str) {
    var scmAsts = scheme.readMutil(str);
    var str = "";
    for(var i = 0; i < scmAsts.length; i++)
        str += compileAST(scmAsts[i]/*, s.globalEnv*/) + ";";
    return str;
}

function compileAST(exp) {
    if(exp == s.voidValue) {
        return genVoid(exp);
    }
    else if(isSelfEvaluating(exp)) {
        return genLiteral(exp);
    }
    else if(exp.isSymbol()) {
        return genRef(exp);
    }
    else if(exp.isPair()) {
        var first = s.car(exp);
        if(first.isSymbol()) {
            if(first == s.quoteSymbol) {
                return genQuotation(exp);
            }
            else if(first == s.assignmentSymbol) {
                return genAssignment(exp);
            }
            else if(first == s.defineSymbol) {
                return genDefinition(exp);
            }
            else if(first == s.ifSymbol) {
                return genIf(exp);
            }
            else if(first == s.lambdaSymbol) {
                return genLambda(exp);
            }
            else if(first == s.beginSymbol) {
                return genSequence(s.beginActions(exp));
            }
            else if(first == s.letSymbol) return compileAST(s.letToCombination(exp));
            else if(first == s.condSymbol) return compileAST(s.transformCond(exp));
            //else if(first == s.caseSymbol) return compileAST(s.transformCase(exp));
            else if(first == s.andSymbol) return genAnd(exp);
            else if(first == s.orSymbol) return genOr(exp);
            else if(first == s.whenSymbol) return compileAST(s.transformWhen(exp));
            else if(first == s.unlessSymbol) return compileAST(s.transformUnless(exp));
            else if(s.symbolVal(first) == "not") return genNot(exp);
            else if(s.symbolVal(first) == "+") return genPlus(exp);
            else if(s.symbolVal(first) == "-") return genMinus(exp);
            else if(s.symbolVal(first) == "*") return genMul(exp);
            else if(s.symbolVal(first) == "/") return genDiv(exp);
            else if(isCompOp(first)) return genCompOp(exp);
            //else if(first == s.doSymbol) return evaluate(s.transformDo(exp), env);
            //else if(first == s.whileSymbol) return evaluate(s.transformWhile(exp), env);
            //else if(first == s.forSymbol) return evaluate(s.transformFor(exp), env);
        }
        return genCall(exp);
    }
}

function isSelfEvaluating(exp) {
    return (exp.isNumber() || exp.isChar() || exp.isString() || exp.isBoolean());
}


// gen

function genVoid() {
    return "(void 0)";
}

function genLiteral(obj) {
    var str;
    if(obj.isNumber()) {
        str = obj.val;
    }
    else if(obj.isChar()) {
        str = "\"" + s.charVal(obj) + "\"";
    }
    else if(obj.isString()) {
        str = "\"" + s.stringVal(obj) + "\"";
    }
    else if(obj.isBoolean()) {
        str = obj.val ? "true" : "false";
    }
    else if(obj.isSymbol()) {
        str = "\"" + s.symbolVal(obj) + "\"";
    }
    else if(obj.isEmptyList()) {
        str = "[]";
    }
    else if(obj.isPair()) {
        if(s.isList(obj)) {
            return JSON.stringify(s.listToArray(obj).map(compileAST));
        }
    }
    return str;
}

function genRef(exp) {
    var str = s.symbolVal(exp);
    return str.replace(/->/, "_to_").replace(/-/g, "_").replace(/!/g, "");
}

function genQuotation(exp) {
    return genLiteral(s.quoteObject(exp));
}

function genAssignment(exp) {
    var id = compileAST(s.assignmentVar(exp));
    var val = compileAST(s.assignmentVal(exp));
    return id + " = " + val;
}

function genDefinition(exp) {
    var id = compileAST(s.definitionVar(exp));
    if(s.cadr(exp).isSymbol()) {
        var val = compileAST(s.definitionVal(exp));
        return "var " + id + " = " + val + ";";
    }
    else {
        var params = listOfValues(s.cdadr(exp)).join(",");
        var str = "function " + id + "(" + params + ")" + "{"
        str += " return" + genSequence(s.lambdaBody(exp));
        str += "\n}\n";
        return str;
    }
}

function genIf(exp) {
    var alt = s.ifAlternative(exp);
    return "(" + compileAST(s.ifPredicate(exp)) + " ? "
        + compileAST(s.ifConsequent(exp)) + " : "
        + (alt.isEmptyList() ? genVoid() : compileAST(alt))
        + ")";
}

function genCall(exp) {
    var func = compileAST(s.operator(exp));
    if(s.operator(exp).isPair() && s.car(s.operator(exp)) == s.lambdaSymbol)
        func = "(" + func + ")";
    var args = listOfValues(s.operands(exp)).join(",");
    return func + "(" + args + ")";
}

function listOfValues(operands) {
    var values = [];
    while(!operands.isEmptyList()) {
        values.push(compileAST(s.car(operands)));
        operands = s.cdr(operands);
    }
    return values;
}

function genLambda(exp) {
    var formals = s.lambdaParamters(exp);
    var paramters = [];//参数数组
    var minArgs, maxArgs;
    if(formals.isPair()) {
        var isList = false;
        var listLen = 0;
        for(var obj = formals; !isList && obj.isPair(); obj = s.cdr(obj)) {
            listLen++;
            paramters.push(s.car(obj));
            if(s.car(obj).isEmptyList())
                isList = true;
        }
        if(!obj.isEmptyList())
            paramters.push(obj);
    }
    else if(formals.isSymbol()) {
        paramters.push(formals);
    }
    else if(formals.isEmptyList()) {
    }
    
    var str = "function(" + paramters.map(compileAST).join(", ") + ")" + " { \n";
    str += " return" + genSequence(s.lambdaBody(exp));
    str += "\n}";

    return str;
}

function genSequence(exps) {
    var strs = [];
    for(; !exps.isEmptyList(); exps = s.cdr(exps))
        strs.push(compileAST(s.car(exps)));
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
    return "(" + s.mapList(compileAST, s.operands(exp), true).join(" " + op + " ") + ")";
}

function genPrefixOp(exp, op) {
    return "(" + op + compileAST(s.cadr(exp)) + ")";
}

function genPlus(exp) {
    var nums = s.listToArray(s.operands(exp));
    return nums.length == 1 ? genPrefixOp(exp) : genInfixOp(exp, "+");
}

function genMinus(exp) {
    var nums = s.listToArray(s.operands(exp));
    return nums.length == 1 ? genPrefixOp(exp) : genInfixOp(exp, "-");
}

function genMul(exp) {
    return genInfixOp(exp, "*");
}

function genDiv(exp) {
    return genInfixOp(exp, "/");
}

function isCompOp(sym) {
    return ["=","<",">","<=",">="].indexOf(s.symbolVal(sym)) > -1;
}

function genCompOp(exp) {
    var operator = s.symbolVal(s.operator(exp));
    if(operator == "=")
        operator = "==";
    var operands = s.listToArray(s.operands(exp));
    
    var pairs = [];
    for(var i = 0; i < operands.length - 1; i++) {
        pairs.push(compileAST(operands[i]) + operator + compileAST(operands[i + 1]));
    }
    return pairs.join(" && ");
}

s.compileSrcString = compileSrcString;

})(scheme);
