/*
scheme port.
author: hu lang
*/
(function(scm){
"use strict";

scm.makeStringPort = function(str)
{
    var port = {};
    port.offset = 0;
    port.buf = str;
    return port;
}

var eof = -1;

scm.eofp = function(o)
{
    return o == -1;
}

scm.getc = function(port)
{
    if(port.offset < port.buf.length)
        return port.buf[port.offset++];
    else
        return eof;
}

scm.ungetc = function(port)
{
    if(port.offset > 0)
        port.offset--;
}

})(scheme);
