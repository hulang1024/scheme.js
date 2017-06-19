var IDE = function() {
    var ide = this;

    this.signals = {
        mainPanelSizeChanged: new signals.Signal()
    };

    var editor = new Editor(ide);
    ide.editor = editor;

    var replConsole = new REPLConsole(ide);
    ide.replConsole = replConsole;
    scheme.console = replConsole; 

    var menuBar = new Menubar(ide);
    ide.menuBar = menuBar;
    document.body.appendChild(menuBar.dom);

    var toolBar = new ToolBar(ide);
    ide.toolBar = toolBar;
    document.body.appendChild(toolBar.dom);

    var container = new UI.Panel();
    container.setId('content');
    container.add(editor);
    container.add(replConsole);

    document.body.appendChild(container.dom);

    editor.setValue('');
    replConsole.clear();
    replConsole.resetInput();
}

loadScheme("../", function(){
    $('#loading').remove();
    new IDE();
});
