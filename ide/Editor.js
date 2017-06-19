// Define Area Editor
var Editor = function(ide) {
    var container = new UI.Panel();
    container.setId('definitions');
    this.container = container;

    var codemirror = CodeMirror(container.dom, {
        value: '',
        lineNumbers: true,
        matchBrackets: true,
        lineWrapping: true,
        matchBrackets: true,
        indentWithTabs: true,
        tabSize: 4,
        indentUnit: 4,
    });    
    codemirror.setSize('height', "100%");
    codemirror.setOption('theme', "scheme-classic-color");

    this.codemirror = codemirror;

}

Editor.prototype = {
    setValue: function(content) {
        return this.codemirror.setValue(content);
    },
    getValue: function() {
        return this.codemirror.getValue();
    }
};