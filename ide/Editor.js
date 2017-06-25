var Editor = function(ide) {
    var container = new UI.Panel();
    container.setId('definitions');

    var config = new Config('editor');
    container.config = config;

    var codemirror = CodeMirror(container.dom, {
        value: '',
        lineNumbers: config.get('lineNumbersShow'),
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
        loadFile: function(files) {
            if(!this.files.length)
                return;
            var file = this.files[0];
            var reader = new FileReader();
            reader.onload = function() {
                codemirror.setValue(this.result);
            };
            reader.onprogress = function ( event ) {
                var size = '(' + Math.floor(event.total / 1000).format() + ' KB)';
                var progress = Math.floor((event.loaded / event.total) * 100) + '%';
                console.log('Loading', filename, size, progress);
            };
            reader.readAsText(file);
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