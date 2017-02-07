/*
  eval-apply-loop
 */
(function(s){

"use strict";

var ScmObject = s.ScmObject;
var EnvironmentFrame = s.EnvironmentFrame;

s.initEval = function() {
	s.addGlobalPrimProc("eval", scheme_eval_prim, 2);
}

s.eval = evaluate;
s.apply = apply;

s.evalString = function(str) {
	scheme.error = null;
	var exps = scheme.read(str);
	if(exps.constructor == String) {
		scheme.console.value += exps;
		return;
	}

	var obj;
	for(var i = 0; i < exps.length; i++) {
		try {
			obj = scheme.eval(exps[i], scheme.globalEnvironment);
		} catch(e) {
			scheme.console.value += e + "\n";
			throw e;
		} 
		if(!scheme.error)
			scheme.printValue(obj);
		else {
			scheme.printError();
			break;
		}
	}
	return obj;//last value
}

function scheme_eval_prim(argv) {
	var exp = argv[0];
	var env = argv[1];
	if(!env.isNamespace())
		return s.wrongContract("meval", argv, "namespace?", env);
	return s.eval(exp, env.data);
}

function evaluate(exp, env) {
	if(s.error)
		return s.error;
	
	if(exp == s.voidValue)
		return exp;
	
	if(isSelfEvaluating(exp)) {
		return exp;
	}

	else if(exp.isSymbol()) {
		return lookupVariableValue(exp, env);
	}

	else if(s.isList(exp) && !exp.isEmptyList()) {
		var obj = s.car(exp);
		if(obj.isSymbol()) {
			if(obj == s.quoteSymbol) {
				return evalQuotation(exp);
			}
			else if(obj == s.assignmentSymbol) {
				return evalAssignment(exp, env);
			}
			else if(obj == s.defineSymbol) {
				return evalDefinition(exp, env);
			}
			else if(obj == s.ifSymbol) {
				return evalIf(exp, env);
			}
			else if(obj == s.lambdaSymbol) {
				return evalLambda(exp, env);
			}
			else if(obj == s.beginSymbol) {
				return evalSequence(beginActions(exp), env);
			}
			else if(obj == s.condSymbol) {
				return evaluate(condToIf(exp), env);
			}
			else if(obj == s.letSymbol) {
				return evaluate(letToCombination(exp), env);
			}
		}
		return apply(evaluate(operator(exp), env), listOfValues(operands(exp), env));
	}
	else
		s.makeError('eval', "不支持的表达式类型");
}


function apply(procedure, argv) {
	if(s.error)
		return s.error;

	if(procedure.isPrimProc()) {
		return applyPrimitiveProcedure(procedure, argv);
	}
	else if(procedure.isCompProc()) {
		var result = checkCompoundProcedureArguments(procedure, argv);
		if(result) {
			var env = extendEnvironment(s.compProcParamters(procedure), argv, s.compProcEnv(procedure));
			return evalSequence(s.compProcBody(procedure), env);
		}
	}
	else
		s.makeError('application', "expected a procedure that can be applied to arguments");
}

//------------------------
// syntactic abstractions
//------------------------
// if
function ifPredicate(exp) { return s.cadr(exp); }
function ifConsequent(exp) { return s.caddr(exp); }
function ifAlternative(exp) {
	exp = s.cdddr(exp);
	if(exp.isEmptyList())
		return exp;
	else // alternative
		return s.car(exp);
}
function makeIf(predicate, consequent, alternative) {
	return s.arrayToList([s.ifSymbol, predicate, consequent, alternative]);
}

// lambda
function lambdaParamters(exp) { return s.cadr(exp); }
function lambdaBody(exp) { return s.cddr(exp); }
function makeLambda(parameters, body) {
	return s.cons(s.lambdaSymbol, s.cons(parameters, body));
}

// application
function operator(exp) { return s.car(exp); }
function operands(exp) { return s.cdr(exp); }
function makeApplication(operator, operands) {
	return s.cons(operator, operands);
}

// assignment
function assignmentVar(exp) { return s.cadr(exp); }
function assignmentValue(exp) { return s.caddr(exp); }

// cond
function condClauses(exp) { return s.cdr(exp); }
function clauesPredicate(clause) { return s.car(clause); }
function clauseActions(clause) { return s.cdr(clause); }
function isElseClause(clause) { return clauesPredicate(clause) == s.elseSymbol; }

// begin
function beginActions(exp) {
	return s.cdr(exp);
}
function makeBegin(seq) {
	return s.cons(s.beginSymbol, seq);
}

// let
function letBindings(exp) { return s.cadr(exp); }
function letBody(exp) { return s.cddr(exp); }
function letBindingVars(bindings) {
	return s.mapList(function(bind){
		return s.car(bind);
	}, bindings);
}
function letBindingVals(bindings) {
	return s.mapList(function(bind){
		return s.cadr(bind);
	}, bindings);
}
function letToCombination(exp) {
	var bindings = letBindings(exp);
	return makeApplication(makeLambda(letBindingVars(bindings), letBody(exp)), letBindingVals(bindings));
}

// define variable/function
function definitionVar(exp) { 
	if(s.cadr(exp).isSymbol())
		return s.cadr(exp);
	else
		return s.caadr(exp);
}
function definitionVal(exp) {
    if(s.cadr(exp).isSymbol())
        return s.caddr(exp);
    else {
        var formals = s.cdadr(exp);
        var body = s.cddr(exp);
		// to lambda
        return makeLambda(formals, body);
    }
}

function isSelfEvaluating(exp) {
	if(exp.isNumber()) return true;
	else if(exp.isChar()) return true;
	else if(exp.isString()) return true;
	else if(exp.isBoolean()) return true;
	else false;
}

function listOfValues(operands, env) {
	var values = [];
	while(!operands.isEmptyList()) {
		values.push(evaluate(s.car(operands), env));
		operands = s.cdr(operands);
	}
	return values;
}

function evalQuotation(exp) {
	return s.cadr(exp);
}

function evalAssignment(exp, env) {
	setVariableValue(assignmentVar(exp), evaluate(assignmentValue(exp), env), env);
	return s.ok;
}

function evalDefinition(exp, env) {
	var variable = definitionVar(exp);
	var valueExp = definitionVal(exp);
	var value = evaluate(valueExp, env);
	if(value.isCompProc())
		s.setCompProcName(value, variable.data);
	defineVariable(variable, value, env);
	return s.ok;
}

function evalIf(exp, env) {
	if(s.isTrue(evaluate(ifPredicate(exp), env)))
		return evaluate(ifConsequent(exp), env);
	else {
		var alt = ifAlternative(exp);
		if(alt.isEmptyList()) {
			return s.voidValue;
		} else {
			return evaluate(alt, env);
		}
	}
}

function evalLambda(exp, env) {
	var formals = lambdaParamters(exp);
	var minArgs, maxArgs;
	if(s.isList(formals)) {
		minArgs = s.listLength(formals);
	}
	else if(formals.isPair()) {
		minArgs = s.pairsLength(formals);
		maxArgs = -1;
	}
	else if(formals.isSymbol()) {
		minArgs = 0;
		maxArgs = -1;
	}
	else {
		s.makeError('','not an identifier');
	}
	return ScmObject.makeCompProc("", formals, lambdaBody(exp), env, minArgs, maxArgs);
}

function evalSequence(exps, env) {
	var values = [];
	while(!exps.isEmptyList()) {
		values.push( evaluate(s.car(exps), env) );
		exps = s.cdr(exps);
	}
	return values[values.length - 1];
}

function condToIf(exp) {
	return expandClauses(condClauses(exp));
	
	function expandClauses(clauses) {
		if(clauses.isEmptyList())
			return ScmObject.getBoolean(false);
		var first = s.car(clauses);
		var rest = s.cdr(clauses);
		if(isElseClause(first))
			if(rest.isEmptyList())
				return sequenceExp(clauseActions(first));
			else
				s.makeError('badSyntax', "'else' clause must be last");
		else {
			var predicate = clauesPredicate(first);
			var actionSequence= sequenceExp(clauseActions(first));
			if(actionSequence.isEmptyList())
				return makeIf(s.True, predicate, expandClauses(rest));
			else
				return makeIf(predicate, actionSequence, expandClauses(rest));
		}
	}
	function sequenceExp(seq) {
		if(seq.isEmptyList()) return seq;
		else if(s.cdr(seq).isEmptyList()) return s.car(seq);
		return makeBegin(seq);
	}
}

function applyPrimitiveProcedure(proc, argv) {
	var result = checkPimitiveProcedureArguments(proc, argv);
	if(result) {
		return s.primProcFunc(proc)(argv);
	}
	else
		return result;
}

function lookupVariableValue(variable, env) {
	var value;
	while(env && ((value = env.map[variable.data]) == undefined))
		env = env.baseEnv;
	if(value == undefined)
		return s.makeError('undefined', variable.data);
	return value;
}

function extendEnvironment(variables, values, baseEnv) {
	var map = {};
	if(s.isList(variables)) {
		variables = s.listToArray(variables);
		for(var i = 0; i < variables.length; i++)
			map[variables[i].data] = values[i];
	}
	else if(variables.isPair()) {
		variables = s.pairToArray(variables);
		var i;
		for(i = 0; i < variables.length - 1; i++)
			map[variables[i].data] = values[i];
		var restParameterIndex = i;
		var restValues = s.arrayToList(values.slice(restParameterIndex));
		map[variables[restParameterIndex].data] = restValues;
	}
	else if(variables.isSymbol()) {
		var variable = variables;
		map[variable.data] = s.arrayToList(values);
	}

	return new EnvironmentFrame(map, baseEnv);
}

function defineVariable(variable, value, env) {
	var name = variable.data;
	env.map[name] = value;
}

function setVariableValue(variable, value, env) {
	var name = variable.data;
	while(env && !env.map.hasOwnProperty(name))
		env = env.baseEnv;
	if(env == null)
		return s.makeError('undefined', name);
	env.map[name] = value;
}

function checkPimitiveProcedureArguments(procedure, argv) {
	var procedureName = s.primProcName(procedure);
	var arity = s.primProcArity(procedure);
	return matchArity(procedureName, argv, arity);
}

function checkCompoundProcedureArguments(procedure, argv) {
	var procedureName = s.compProcName(procedure);
	var arity = s.compProcArity(procedure);
	return matchArity(procedureName, argv, arity);
}

function matchArity(procedureName, argv, arity) {
	var min = arity[0];
	var mismatch = false;
	var isAtleast = true;
	var expected = "";
	if(arity.length == 1) {
		if(argv.length != min)
			mismatch = true;
		expected = min;
	}
	else if(arity.length == 2) {
		var max;
		if(arity[1] != -1) {
			max = arity[1];
			isAtleast = false;
			expected = min + " to " + max;
		} else {
			max = 0x3FFFFFFE;
			expected = min;
		}
		if(!(min <= argv.length && argv.length <= max))
			mismatch = true;
	}
	if(mismatch) 
		s.makeArityMismatchError(procedureName, argv, isAtleast, expected, argv.length);
	return !mismatch;
}

})(scheme);