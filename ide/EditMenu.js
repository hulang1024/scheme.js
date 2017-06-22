var EditMenu = function(ide) {
    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent(localeBundle.getString('Edit'));
    container.add(title);

    var items = new UI.Panel();
    items.setClass('menuitems');
    container.add(items);


    var cmdItemProps = [
        {title: localeBundle.getString('Undo'), key: 'Ctrl+Z', cmd: 'undo'},
        {title: localeBundle.getString('Redo'), key: 'Ctrl+Y', cmd: 'redo'},
        {title: localeBundle.getString('SelectAll'), key: 'Ctrl+A', cmd: 'selectAll'}
    ];

    for(var i = 0; i < cmdItemProps.length; i++) {
        (function() {
            var itemProp = cmdItemProps[i];
            var item = new UI.Row();
            item.setClass('menuitem');
            item.setTextContent(itemProp.title + '  (' + itemProp.key + ')');
            item.onClick(function(){
                ide.editor.command( itemProp.cmd );
            });
            items.add(item);
        })();
    }

    return container;
}