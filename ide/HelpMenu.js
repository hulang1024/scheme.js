var HelpMenu = function(ide) {
    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent(localeBundle.getString('Help'));
    container.add(title);

    var items = new UI.Panel();
    items.setClass('menuitems');
    container.add(items);

    var item = new UI.Row();
    item.setClass('menuitem');
    item.setTextContent(localeBundle.getString('About'));
    item.onClick(function() {
        window.open('http://github.com/hlpp/scheme.js/', '_blank');
    });
    items.add(item);
    items.add(new UI.HorizontalRule());
    
    var langItemProps = [];
    for(var loc in localisationResources) {
        if(loc != localeBundle.getLocale())
            langItemProps.push({title: localisationResources[loc].InteractInLanuage, locale: loc});
    }
    for(var i = 0; i < langItemProps.length; i++) {
        (function() {
            var itemProp = langItemProps[i];
            var item = new UI.Row();
            item.setClass('menuitem');
            item.setTextContent(itemProp.title);
            item.onClick(function() {
                var setLocale = itemProp.locale;
                var setLangConfrim = localisationResources[setLocale].ChangeGUILanuageRestartConfirm;
                var nowLangConfrim = localeBundle.getString('ChangeGUILanuageRestartConfirm');
                if(confirm(setLangConfrim + '\n\n' + nowLangConfrim + '\n')) {
                    ide.config.set('GUILanguage', setLocale);
                    // location.reload();
                    location.href = location.href; // faster 
                }
            });
            items.add(item);
        })();
    }
    
    return container;
}