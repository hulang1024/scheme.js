var SchemeMenu = function(ide) {
    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent('Scheme');
    container.add(title);

    var items = new UI.Panel();
    items.setClass('menuitems');
    container.add(items);


    var item = new UI.Row();
    item.setClass('menuitem');
    item.setTextContent('Run');
    item.onClick(function() {
        ide.replConsole.clear();
        scheme.evalStringWithNewEnv(ide.editor.getValue());
        ide.replConsole.resetInput();
    });
    items.add(item);
    
    var item = new UI.Row();
    item.setClass('menuitem');
    item.setTextContent('Compile Output');
    item.onClick(function() {
        ide.replConsole.clear();
        ide.replConsole.log("write", scheme.compileSrcString(ide.editor.getValue()));
        ide.replConsole.resetInput();
    });
    items.add(item);
    
    var item = new UI.Row();
    item.setClass('menuitem');
    item.setTextContent('Compile & Run');
    item.onClick(function() {
        ide.replConsole.clear();
        ide.replConsole.log("display", eval( scheme.compileSrcString(ide.editor.getValue()) ) );
        ide.replConsole.resetInput();
    });
    items.add(item);
    
    return container;
}