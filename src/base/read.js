/*
scheme reader.
author: hu lang
*/
(function(scm)
{
"use strict";

scm.initRead = function(env)
{
    scm.addPrimProc(env, "read", read_prim, 0, 1);
}

function read_prim(argv)
{
    var port = scm.currentInputPort;
    if(argv.length > 0) {
        port = argv[0];
        if(!scheme.isInputPort(port))
            return scheme.wrongContract("read", "input-port?", 0, argv);
    }
    port.open();
    return read(port);
}

scm.readMutil = function(src)
{
    var port = scm.makeStringInputPort(src);
    
    var objs = [];
    var obj;
    while(!scm.eofp( scm.getc(port) )) {
        scm.ungetc(port);
        obj = read(port);
        if(obj != null)
            objs.push(obj);
    }
    return objs;
}

function read(port)
{
    var obj = null;
    
    skip_whitespace_comments(port);
    
    var c = scm.getc(port);
    
    switch(c) {
    case '#':
        c = scm.getc(port);
        switch(c) {
        case 't':
            obj = scm.True;
            break;
        case 'f':
            obj = scm.False;
            break;
        case '\\':
            obj = read_char(port);
            break;
        default:
            obj = read_number(port, c, 1);
        }
        break;
    case '-':
    case '+': //TODO: +1a also a identifler
        if(isdigit(scm.getc(port))) {
            scm.ungetc(port);
            obj = read_number(port, 10, c == '-' ? -1 : 1);
        } else {
            scm.ungetc(port);
            obj = read_symbol(c, port);
        }
        break;
    case '.': //TODO: .5 == 0.5
        obj = read_symbol(c, port);
        break;
    case '(':
    case '[':
        obj = read_list(port);
        break;
    case '"':
        obj = read_string(port);
        break;
    case '\'':
        obj = read_quote_abbrev(port);
        break;
    default:
        if(isdigit(c)) {
            scm.ungetc(port);
            obj = read_number(port, 10, 1);
        } else if(isletter(c) || is_special_inital(c)) {
            obj = read_symbol(c, port);
        }
    }
    
    return obj;
}

function read_list(port)
{
    var head = scm.nil, prev = null, curr;
    var found_dot = 0;
    var o;
    var c;
    while(1) {
        c = scm.getc(port);
        if(c == ')' || c == ']' || scm.eofp(c))
            break;
        
        scm.ungetc(port);
        o = read(port);
        skip_whitespace_comments(port);
        
        if(prev != null) {
            if(o != scm.dotSymbol) {
                if(!found_dot) {
                    curr = scm.cons(o, scm.nil);
                    prev.cdr = curr;
                    prev = curr;
                } else {
                    prev.cdr = o;
                }
            } else {
                found_dot = 1;
            }
        } else {
            head = prev = scm.cons(o, scm.nil);
        }
    }
    return head;
}

function read_quote_abbrev(port)
{
    return scm.cons(scm.quoteSymbol, scm.cons(read(port), scm.nil));
}

function read_symbol(initch, port)
{
    var buf = initch;
    var c;
    while(1) {
        c = scm.getc(port);
        if(isdelimiter(c)) {
            scm.ungetc(port);
            break;
        } else if(scm.eofp(c))
            break;
        buf += c;
    }
    
    return scm.internSymbol(buf);
}

function read_string(port) {
    var buf = '';
    var escape_state = 0;
    var c;
    while(1) {
        c = scm.getc(port);
        if(c == '\\')
            escape_state = 1;
        else if(c == '"') {
            if(escape_state == 0)
                break;
            else if(escape_state == 1) {
                escape_state = 0;
                //TODO: switch escape 
            }
        } else if(scm.eofp(c))
            break;
        buf += c;
    }
    return scm.makeString(buf);
}

function read_number(port, radixc, sign)
{
    switch(radixc) {
    case 10:
        var buf = [];
        var i = 0;
        var dot = 0;
        var c;
        while(1) {
            c = scm.getc(port);
            if(isdigit(c)) {
                buf += c;
            } else if(c == '.') {
                if(dot) {
                    read_error();
                    return;
                }
                dot = 1;
                buf += c;
            } else if(scm.eofp(c)) {
                break;
            } else {
                scm.ungetc(port);
                break;
            }
        }
        
        if(dot) {
            var num = parseFloat(buf);
            if(sign < 0) num *= sign;
            return scm.makeDouble(num);
        } else {
             var num = parseInt(buf);
            if(sign < 0) num *= sign;
            return scm.makeInt(num);
        }
    case 'b':
        // radix 2
    case 'o':
        // radix 8
    case 'd':
        // radix 10
    case 'x':
        // radix 16
    default:
        read_error();
        return;
    }
}

function read_char(port)
{
    var c = scm.getc(port);
    //TODO: character name: space | newline
    return scm.makeChar(c);
}

function skip_whitespace_comments(port)
{
    var c;
    while(1) {
        c = scm.getc(port);
        if(isspace(c))
            continue;
        else if(c == ';') {
            while(1) {
                c = scm.getc(port);
                if(c == '\n')
                    break;
                else if(scm.eofp(c))
                    return;
            }
        }
        else
            break;
    }
    scm.ungetc(port);
}

function read_error()
{
    return scm.throwError("read", "unexpected");
}

function isspace(c)
{
    switch(c) {
    case ' ': case '\t': case '\v':
    case '\r': case '\n': case '\b':
    case '\f':
        return 1;
    }
    return 0;
}

function isdigit(c) { return '0' <= c && c <= '9'; }

function isletter(c) { return 65 <= String.charCodeAt(c) && String.charCodeAt(c) <= 122; }

function isdelimiter(c)
{
    if(isspace(c))
        return 1;
    switch(c) {
    case '(': case ')':
    case '[': case ']':
    case '"': case ';':
        return 1;
    }
    return 0;
}


function is_special_inital(c)
{
    switch(c) {
    case '!': case '$': case '%':
    case '&': case '*': case '/':
    case ':': case '<': case '=':
    case '>': case '?': case '^':
    case '_': case '~':
        return 1;
    }
    return 0;
}

function is_peculiar_identifier(c)
{
    switch(c) {
    case '+': case '-':
    // and case '...'
        return 1;
    }
    return 0;
}

function is_sepcial_subsequent(c)
{
    switch(c) {
    case '+': case '-':
    case '.': case '@':
        return 1;
    }
    return 0;
}

})(scheme);