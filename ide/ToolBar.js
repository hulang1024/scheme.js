var ToolBar = function(ide) {
    var container = new UI.Panel();
    container.setId('toolbar');

    var runButton = new UI.Button('Run');
    runButton.setId('run');
    runButton.onClick(function() {
        ide.replConsole.clear();
        scheme.evalStringWithNewEnv(ide.editor.getValue());
        ide.replConsole.resetInput();
    });
    container.add(runButton);

    var clsButton = new UI.Button('Clear Console');
    clsButton.setId('clearConsole');
    clsButton.onClick(function(){
        ide.replConsole.clear();
        ide.replConsole.resetInput();
    });
    container.add(clsButton);

    return container;
}