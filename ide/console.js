function Console() {
    var divConsole;
    var consoleInput;
    var self = this;
    
    this.clear = function() {
        divConsole.innerHTML = "<p>Welcome to <a target=\"_blank\" href=\"http://github.com/hlpp/JSScheme\" style=\"color:blue\">JSScheme</a>.</p>";
    }
    
    this.resetInput = function() {
        divConsole.innerHTML += "<p class=\"code_echo\"><span class=\"prompt\">&gt;</span><input type=\"text\" id=\"consoleInput\" /></p>";
        consoleInput = document.getElementById("consoleInput");
        consoleInput.onkeydown = consoleInputKeyDown;
        consoleInput.focus();
    }

    function consoleInputKeyDown(event) {
        switch(event.keyCode) {
        case 13://enter
            if(consoleInput.value.trim().length) {
                historyLook.push(consoleInput.value);
                historyLook.lastInput = null;
                scheme.evalStringWithEnv(consoleInput.value, scheme.globalEnvironment);
                self.echoCodeAndResetInput();
            }
            break;
        case 38://up
            if(historyLook.lastInput == null)
                historyLook.lastInput = consoleInput.value.trim();
            if(historyLook.hasPrev()) {
                consoleInput.value = historyLook.prev();
                moveToEnd(consoleInput);
            }
            break;
        case 40://down
            if(historyLook.lastInput == null)
                historyLook.lastInput = consoleInput.value.trim();
            if(historyLook.hasNext())
                consoleInput.value = historyLook.next();
            else {
                historyLook.bottom();
                consoleInput.value = historyLook.lastInput;
            }
            moveToEnd(consoleInput);
            break;
        default:
            if(!historyLook.hasNext())
                historyLook.lastInput = (consoleInput.value + String.fromCharCode(event.keyCode)).trim();
        }
        
        function moveToEnd(obj) {
            obj.focus(); 
            var len = obj.value.length; 
            if (document.selection) { 
                var sel = obj.createTextRange(); 
                sel.moveStart('character', len);
                sel.collapse(); 
                sel.select(); 
            } else if (typeof obj.selectionStart == 'number' && typeof obj.selectionEnd == 'number') { 
                obj.selectionStart = obj.selectionEnd = len; 
            } 
        } 
    }
    
    this.echoCodeAndResetInput = function() {
        var p = consoleInput.parentNode;
        p.removeChild(consoleInput);
        p.children[0].className += " dead";
        var codeSpan = document.createElement("span");
        codeSpan.innerHTML += consoleInput.value;
        p.appendChild(codeSpan);
        self.resetInput();
    }
    
    /*
     @param type  "write","display","error" or null
    */
    this.log = function(type, info) {
        if(typeof info == "string")
            info = info.replace(/\n/g, "</br>").replace(/\s/g, "&nbsp;");
        var response = document.createElement('span');
        
        response.className = "scheme_response";
        if(type == "write")
            response.className += " scheme_write_object";
        else if(type == "display")
            response.className += " scheme_write_object";
        else if(type == "error")
            response.className += " scheme_error_info";
        response.innerHTML = info;
        divConsole.appendChild(response);
    }
    
    function HistoryLook() {
        var inputs = [];
        var index = 0;
        
        this.lastInput = null;
        this.push = function(input) {
            inputs.push(input);
            index = inputs.length;
        }
        this.hasPrev = function() { return index - 1 >= 0; }
        this.hasNext = function() { return index + 1 <= inputs.length - 1; }
        this.prev = function() { return inputs[--index]; }
        this.next = function() { return inputs[++index]; }
        this.bottom = function() { index = inputs.length; }
    }
    
    var historyLook = new HistoryLook();
    
    divConsole = document.getElementById('console');
    this.divConsole = divConsole;
    divConsole.style.display = "block";
    divConsole.onclick = function(event) {
        if(event.toElement == divConsole)
            consoleInput.focus();
    }
    
    this.clear();
    this.resetInput();
}

