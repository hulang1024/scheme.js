var FileMenu = function(ide) {
    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent('File');
    container.add(title);

    var items = new UI.Panel();
    items.setClass('menuitems');
    container.add(items);

    var exportItem = new UI.Row();
    exportItem.setClass('menuitem');
    exportItem.setTextContent('Export');
    exportItem.onClick(function(){
        var output = ide.editor.getValue();

        var blob = new Blob( [ output ], { type: 'text/plain' } );
        var objectURL = URL.createObjectURL( blob );

        window.open( objectURL, '_blank' );
        window.focus();
    });
    items.add(exportItem);
    
    return container;
}