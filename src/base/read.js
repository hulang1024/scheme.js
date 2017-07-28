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
        case 'T':
            obj = scm.True;
            break;
        case 'f':
        case 'F':
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
            obj = read_symbol(port, c);
        }
        break;
    case '.': //TODO: .5 == 0.5
        obj = read_symbol(port, c);
        break;
    case '(':
    case '[':
    case '{':
        obj = read_list(port);
        break;
    case '"':
        obj = read_string(port);
        break;
    case '\'':
        obj = read_quote(port);
        break;
    default:
        if(scm.eofp(c)) {
            break;
        } else if(isdigit(c)) {
            scm.ungetc(port);
            obj = read_number(port, 10, 1);
        } else if(isalpha(c) || is_special_inital(c)) {
            obj = read_symbol(port, c);
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
        if(c == ')' || c == ']' || c == '}' || scm.eofp(c))
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

function read_quote(port)
{
    return scm.cons(scm.quoteSymbol, scm.cons(read(port), scm.nil));
}

function read_symbol(port, initch)
{
    var buf = initch;
    var c;
    while(1) {
        c = scm.getc(port);
        if(isdelimiter(c)) {
            scm.ungetc(port);
            break;
        } else if(scm.eofp(c)) {
            break;
        }
        buf += c;
    }
    
    return scm.internSymbol(buf);
}

function read_string(port)
{
    var buf = '';
    var ch;
    while(1) {
        ch = scm.getc(port);
        // escape sequence handling
        if(ch == '\\') {
            ch = scm.getc(port);
            switch(ch) {
            case '\\': case '\"': case '\'': break;
            case 'a': ch = '\a'; break;
            case 'b': ch = '\b'; break;
            //case 'e': ch = '\33'; break; /* escape */
            case 'f': ch = '\f'; break;
            case 'n': ch = '\n'; break;
            case 'r': ch = '\r'; break;
            case 't': ch = '\t'; break;
            case 'v': ch = '\v'; break;
            case 'x':
                // TODO:
            case 'u':
            case 'U':
                // TODO:
            default:
                //if(isodigit(ch))
                ;
            }
        } else if(ch == '"') {
            break;  
        } else if(scm.eofp(ch)) {
            break;
        }
        buf += ch;
    }
    return scm.makeString(buf);
}

function read_number(port, radixc, sign)
{
    switch(radixc) {
    case 'b':
    case 'B':
        // radix 2
    case 'o':
    case 'O':
        // radix 8
    case 'd':
    case 'D':
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
        break;
    case 'x':
    case 'X':
        // radix 16
    default:
        read_error();
        return;
    }
}

function read_char(port)
{
    var buf = '';
    var c;
    while(1) {
        c = scm.getc(port);
        if(isdelimiter(c)) {
            scm.ungetc(port);
            break;
        } else if(scm.eofp(c)) {
            break;
        }
        buf += c;
    }
    if(buf.length == 1) {
        c = buf;
    } else {
        if(buf == 'space')
            c = ' ';
        else if(buf == 'newline')
            c = '\n';
    }
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
                if(c == '\n' || c == '\r')
                    break;
                else if(scm.eofp(c))
                    return;
            }
        } else
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
    case '\r': case '\n': case '\f':
        return 1;
    }
    return 0;
}

function isdigit(c) { return '0' <= c && c <= '9'; }
function isodigit(c) { return '0' <= c && c <= '7'; }
function isxdigit(c) { return isdigit(c) || (('a' <= c && c <= 'f') || ('A' <= c && c <= 'F')); }
function isalpha(c) { return 'A' <= c && c <= 'z'; }

function isdelimiter(c)
{
    if(isspace(c))
        return 1;
    switch(c) {
    case '(': case ')':
    case '[': case ']':
    case '{': case '}':
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