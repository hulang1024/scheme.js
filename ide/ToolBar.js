var ToolBar = function(ide) {
    var container = new UI.Panel();
    container.setId('toolbar');
    var self = container;

    var config = new Config('view');

    self.setVisible(config.get('toolbar.show'));

    var runButton = new UI.Button(window.localeBundle.getString('Run'));
    runButton.setId('run');
    runButton.onClick(function() {
        ide.replConsole.clear();
        scheme.evalStringWithNewEnv(ide.editor.getValue());
        ide.replConsole.resetInput();
    });
    container.add(runButton);

    var clsButton = new UI.Button(window.localeBundle.getString('ClearConsole'));
    clsButton.setId('clearConsole');
    clsButton.onClick(function(){
        ide.replConsole.clear();
        ide.replConsole.resetInput();
    });
    container.add(clsButton);

    return container;
}