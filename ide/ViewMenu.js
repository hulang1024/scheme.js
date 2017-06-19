var ViewMenu = function(ide) {
    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent('View');
    container.add(title);

    var items = new UI.Panel();
    items.setClass('menuitems');
    container.add(items);


    var item = new UI.Row();
    item.setClass('menuitem');
    item.setTextContent('Decrease Font Size');
    item.onClick(function(){
        resetFontSize(-1);
    });
    items.add(item);

    var item = new UI.Row();
    item.setClass('menuitem');
    item.setTextContent('Increase Font Size');
    item.onClick(function(){
        resetFontSize(+1);
    });
    items.add(item);

    var item = new UI.Row();
    item.setClass('menuitem');
    item.setTextContent('Toolbar');
    item.onClick(function(){
        var val = ! $(ide.toolBar.dom).is(':visible');
        $(ide.toolBar.dom)[val ? 'show' : 'hide']();
    });
    items.add(item);


    var mainPanelRecords = {
        'Definitions': {
            visible: true,
            panel: ide.editor,
            lastHeight: $(ide.editor.dom).height() + '%'
        },
        'Interactions': {
            visible: true,
            panel: ide.replConsole,
            lastHeight: $(ide.replConsole.dom).height() + '%'
        }
    };

   function toggleMainPanelVisible(thisName) {
        var thisRecord = mainPanelRecords[thisName];

        var thatRecord = null;
        for(var name in mainPanelRecords)
            if(name != thisName)
                thatRecord = mainPanelRecords[name];

        thisRecord.visible = !thisRecord.visible;
        setState(thisRecord, thisRecord.visible);
        if(thisRecord.visible == false) {
            if(thatRecord.visible == false)
                setState(thatRecord, true);
            $(thisRecord.panel.dom).css('height', '0');
            $(thatRecord.panel.dom).css('height', '100%');
        } else {
            if(thatRecord.visible == true) {
                $(thisRecord.panel.dom).css('height', thisRecord.lastHeight);
                $(thatRecord.panel.dom).css('height', thatRecord.lastHeight);
            } else {
                $(thisRecord.panel.dom).css('height', '100%');
                $(thatRecord.panel.dom).css('height', '0');
            }
        }
        function setState(record, b) {
            record.visible = b;
            $(record.panel.dom)[b ? 'show' : 'hide']();
            record.menuItem.setTextContent((b ? 'Hide ' : 'Show ') + record.menuItem.titleName);
        }
    }

    var item = new UI.Row();
    item.setClass('menuitem');
    item.titleName = 'Definitions';
    item.setTextContent('Hide Definitions');
    item.onClick(function(){
        toggleMainPanelVisible('Definitions');
    });
    items.add(item);
    mainPanelRecords['Definitions'].menuItem = item;

    var item = new UI.Row();
    item.setClass('menuitem');
    item.titleName = 'Interactions';
    item.setTextContent('Hide Interactions');
    item.onClick(function(){
        toggleMainPanelVisible('Interactions');
    });
    items.add(item);
    mainPanelRecords['Interactions'].menuItem = item;


    var item = new UI.Row();
    item.setClass('menuitem');
    item.setTextContent('Hide Line Numbers');
    item.onClick(function(){
        var val = ! ide.editor.getOption('lineNumbers');
        ide.editor.setOption('lineNumbers', val);
        this.setTextContent(val ? 'Hide Line Numbers' : 'Show Line Numbers');
    });
    items.add(item);


    function resetFontSize(inc) {
        var fontSize = parseInt($(ide.editor.dom).css('fontSize'));
        fontSize += inc;
        $(ide.editor.dom).css('fontSize', fontSize + 'px');
        $(ide.replConsole.dom).css('fontSize', fontSize + 'px');
    }

    ide.signals.mainPanelSizeChanged.add(function() {
        mainPanelRecords['Definitions'].lastHeight = $(ide.editor.dom).height();
        mainPanelRecords['Interactions'].lastHeight = $(ide.replConsole.dom).height();
    });

    return container;
}