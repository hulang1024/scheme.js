var HelpMenu = function(ide) {
    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent(window.localeBundle.getString('Help'));
    container.add(title);

    var items = new UI.Panel();
    items.setClass('menuitems');
    container.add(items);

    var item = new UI.Row();
    item.setClass('menuitem');
    item.setTextContent(window.localeBundle.getString('About'));
    item.onClick(function() {
        window.open('http://github.com/hlpp/scheme.js/', '_blank');
    });
    items.add(item);

    var langItemProps = [];
    for(var loc in localisationResources) {
        langItemProps.push({title: localisationResources[loc].InteractInLanuage, locale: loc});
    }
    for(var i = 0; i < langItemProps.length; i++) {
        (function() {
            var itemProp = langItemProps[i];
            var item = new UI.Row();
            item.setClass('menuitem');
            item.setTextContent(itemProp.title);
            item.onClick(function() {
                if(confirm(window.localeBundle.getString('ChangeGUILanuageRestartConfirm'))) {
                    ide.config.set('GUILanguage', itemProp.locale);
                    location.reload();
                }
            });
            items.add(item);
        })();
    }
    
    return container;
}