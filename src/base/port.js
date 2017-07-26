/*
scheme port.
author: hu lang
*/
(function(scm)
{
"use strict";

scm.initPort = function(env)
{
    scm.addPrimProc(env, "input-port?", input_port_p, 1);
    scm.addPrimProc(env, "output-port?", output_port_p, 1);
    scm.addPrimProc(env, "current-input-port", current_input_port_prim, 0);
    scm.addPrimProc(env, "current-output-port", current_output_port_prim, 0);
}

scm.InputPort = function()
{
    var port = new scm.Object(scheme_input_port_type);
    
    port.offset = 0;
    
    port.buf = "";
    
    port.open = function() {}
    
    port.iseof = function()
    {
        return port.offset >= port.buf.length;
    }
    
    return port;
}

scm.OutputPort = function()
{
    var port = new scm.Object(scheme_output_port_type);
    port.offset = 0;
    port.buf = "";
    return port;
}

scm.currentInputPort = makeCurrentInputPort();

scm.currentOutputPort = makeCurrentOutputPort();

function input_port_p(argv)
{
    return scheme.getBoolean(scheme.isInputPort(argv[0]));
}

function output_port_p(argv)
{
    return scheme.getBoolean(scheme.isOutputPort(argv[0]));
}

function current_input_port_prim()
{
    return scm.currentInputPort;
}

function current_output_port_prim()
{
    return scm.currentOutputPort;
}

function makeCurrentInputPort()
{
    var port = new scm.InputPort();
    port.open = function() {
        if(this.iseof()) {
            this.offset = 0;
            this.buf = window.prompt();
        }
    }
    return port;
}

function makeCurrentOutputPort()
{
    // TODO:
}

scm.makeStringInputPort = function(str)
{
    var port = new scm.InputPort();
    port.buf = str;
    return port;
}

var eof = new scm.Object(scheme_eof_type);

scm.eofp = function(o)
{
    return o == eof;
}

scm.getc = function(port)
{
    if(!port.iseof())
        return port.buf[port.offset++];
    else {
        port.offset++;
        return eof;
    }
}

scm.ungetc = function(port)
{
    if(port.offset > 0)
        port.offset--;
}

})(scheme);
