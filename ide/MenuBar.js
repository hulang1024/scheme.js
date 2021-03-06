var Menubar = function(ide) {
    var container = new UI.Panel();
    container.setId('menubar');

    container.add( new FileMenu(ide) );
    container.add( new EditMenu(ide) );
    container.add( new ViewMenu(ide) );
    container.add( new SchemeMenu(ide) );
    container.add( new ExamplesMenu(ide) );
    container.add( new HelpMenu(ide) );
 
    return container;
}