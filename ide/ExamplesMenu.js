var ExamplesMenu = function(ide) {
    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent(localeBundle.getString('Examples'));
    container.add(title);

    var items = new UI.Panel();
    items.setClass('menuitems');
    container.add(items);


    var itemProps = [
        {title: 'SICP chapter1', file: 'ch1.scm'},
        {title: 'SICP chapter2 support', file: 'ch2support.scm'},
        {title: 'SICP chapter2', file: 'ch2.scm'},
        {title: 'SICP chapter2 tests', file: 'ch2tests.scm'},
        {title: 'SICP chapter3 support', file: 'ch3support.scm'},
        {title: 'SICP chapter3', file: 'ch3.scm'},
    ];

    for(var i = 0; i < itemProps.length; i++) {
        (function() {
            var itemProp = itemProps[i];
            var item = new UI.Row();
            item.setClass('menuitem');
            item.setTextContent(itemProp.title);
            item.onClick(function() {
                if(confirm(localeBundle.getString('UnsavedCodeLostConfrim'))) {
                    var req = new XMLHttpRequest();
                    req.open('GET', '../tests/SICP/' + itemProp.file, true);
                    req.addEventListener('load', function(event){
                        var content = event.target.responseText;
                        ide.editor.setValue(content);
                    }, false);
                    req.send(null);
                }
            });
            items.add(item);
        })();
    }

    return container;
}