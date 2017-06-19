var HelpMenu = function(ide) {
    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent('Help');
    container.add(title);

    var items = new UI.Panel();
    items.setClass('menuitems');
    container.add(items);

    var item = new UI.Row();
    item.setClass('menuitem');
    item.setTextContent('About');
    item.onClick(function(){
        window.open('http://github.com/hlpp/scheme.js/', '_blank');
    });
    items.add(item);

    return container;
}