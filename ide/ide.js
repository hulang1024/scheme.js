var IDE = function() {
	var ide = this;

	var menuBar = new Menubar(ide);
	ide.menuBar = menuBar;
	document.body.appendChild(menuBar.dom);

	var toolBar = new ToolBar(ide);
	ide.toolBar = toolBar;
	document.body.appendChild(toolBar.dom);

	var container = new UI.Panel();
	container.setId('content');
	var editor = new Editor(ide);
	ide.editor = editor;
	container.add(editor.container);

	var replConsole = new REPLConsole(ide);
	scheme.console = replConsole; 
	ide.replConsole = replConsole;
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
