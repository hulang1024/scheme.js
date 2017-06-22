var ViewMenu = function(ide) {
    var config = new Config('view');
    
    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent(window.localeBundle.getString('View'));
    container.add(title);

    var items = new UI.Panel();
    items.setClass('menuitems');
    container.add(items);


    var decFontSizeItem = new UI.Row();
    decFontSizeItem.setClass('menuitem');
    decFontSizeItem.onClick(function(){
        resetFontSize(-1);
    });
    items.add(decFontSizeItem);

    var incFontSizeItem = new UI.Row();
    incFontSizeItem.setClass('menuitem');
    incFontSizeItem.onClick(function(){
        resetFontSize(+1);
    });
    items.add(incFontSizeItem);

    setFontSize(config.get('fontSize'), 1);

    
    var item = new UI.Row();
    item.setClass('menuitem');
    item.setTextContent((config.get('toolbar.show') ? window.localeBundle.getString('Hide') : window.localeBundle.getString('Show'))
        + window.localeBundle.getString('ToolBar'));
    item.onClick(function(){
        var val = ! $(ide.toolBar.dom).is(':visible');
        ide.toolBar.setVisible(val);
        config.set('toolbar.show', val);
        this.setTextContent((val ? window.localeBundle.getString('Hide') : window.localeBundle.getString('Show'))
            + window.localeBundle.getString('ToolBar'));
    });
    items.add(item);

    var mainPanelRecords = {
        Definitions: {
            visible: true,
            panel: ide.editor,
            lastHeight: $(ide.editor.dom).height() + '%'
        },
        Interactions: {
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
            record.menuItem.setTextContent((b ? window.localeBundle.getString('Hide') : window.localeBundle.getString('Show'))
                + record.menuItem.titleName);
        }
    }

    var item = new UI.Row();
    item.setClass('menuitem');
    item.titleName = window.localeBundle.getString('Definitions');
    item.setTextContent(window.localeBundle.getString('Hide') + window.localeBundle.getString('Definitions'));
    item.onClick(function(){
        toggleMainPanelVisible('Definitions');
    });
    items.add(item);
    mainPanelRecords['Definitions'].menuItem = item;

    var item = new UI.Row();
    item.setClass('menuitem');
    item.titleName = window.localeBundle.getString('Interactions');
    item.setTextContent(window.localeBundle.getString('Hide') + window.localeBundle.getString('Interactions'));
    item.onClick(function(){
        toggleMainPanelVisible('Interactions');
    });
    items.add(item);
    mainPanelRecords['Interactions'].menuItem = item;


    var item = new UI.Row();
    item.setClass('menuitem');
    item.setTextContent(window.localeBundle.getString('HideLineNumbers'));
    item.onClick(function(){
        var val = ! ide.editor.getOption('lineNumbers');
        ide.editor.setOption('lineNumbers', val);
        this.setTextContent(window.localeBundle.getString(val ? 'Hide' : 'Show')
            + window.localeBundle.getString('LineNumbers'));
    });
    items.add(item);


    function resetFontSize(inc) {
        var fontSize = parseInt($(ide.editor.dom).css('fontSize'));
        fontSize += inc;
        setFontSize(fontSize, inc);
    }

    function setFontSize(size, inc) {
        inc = Math.abs(inc);
        $(ide.editor.dom).css('fontSize', size + 'px');
        $(ide.replConsole.dom).css('fontSize', size + 'px');
        decFontSizeItem.setTextContent(window.localeBundle.getString('DecreaseFontSize').replace("${fontSize}", size - inc));
        incFontSizeItem.setTextContent(window.localeBundle.getString('IncreaseFontSize').replace("${fontSize}", size + inc));

        config.set('fontSize', size);
    }

    ide.signals.mainPanelSizeChanged.add(function() {
        mainPanelRecords['Definitions'].lastHeight = $(ide.editor.dom).height();
        mainPanelRecords['Interactions'].lastHeight = $(ide.replConsole.dom).height();
    });

    return container;
}