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

    $.extend(container, {
        setValue: function(content) {
            return codemirror.setValue(content);
        },
        getValue: function() {
            return codemirror.getValue();
        },
        command: function(name) {
            return codemirror.execCommand(name);
        },
        setOption: function(key, value) {
            return codemirror.setOption(key, value);
        },
        getOption: function(key) {
            return codemirror.getOption(key);
        }
    });

    return container;
}