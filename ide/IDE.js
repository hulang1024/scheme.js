var IDE = function() {
    var ide = this;
    
    var config = new Config('ide');
    this.config = config;
    
    this.signals = {
        mainPanelSizeChanged: new signals.Signal()
    };
    
    var locale = Locale.fromDisplayLanguage(config.get('GUILanguage'));
    window.localeBundle = getLocalisationResourceBundle(locale);
    

    var editor = new Editor(ide);
    ide.editor = editor;

    var replConsole = new REPLConsole(ide);
    ide.replConsole = replConsole;
    scheme.console = replConsole; 

    var toolBar = new ToolBar(ide);
    ide.toolBar = toolBar;

    var menuBar = new Menubar(ide);
    ide.menuBar = menuBar;

    var container = new UI.Panel();
    container.setId('content');
    container.add(editor);
    container.add(replConsole);
    
    $(editor.dom).css('height', '50%');
    $(replConsole.dom).css('height', '50%');
    this.signals.mainPanelSizeChanged.dispatch();

    document.body.appendChild(menuBar.dom);
    document.body.appendChild(toolBar.dom);
    document.body.appendChild(container.dom);

    editor.setValue('');
    replConsole.clear();
    replConsole.resetInput();
}

var Loader = function() {
    // 加载显示容器
    var panel = new UI.Panel();
    panel.setWidth('245px');
    panel.setHeight('284px');
    panel.setPosition('absolute');
    panel.setLeft('50%');
    panel.setTop('44%');
    panel.setMargin('-142px 0 0 -123px');
    document.body.appendChild(panel.dom);
    
    // logo Y
    var img = new UI.Element(new Image());
    img.setWidth('100%');
    img.setHeight('252px');
    img.dom.src = 'imgs/y.png';
    panel.add(img);


    // 进度条
    var progressbar = new UI.Panel();
    progressbar.setBorder('1px solid gray');
    progressbar.setBorderRadius('3px');
    progressbar.setWidth('100%');
    progressbar.setHeight('30px');
    progressbar.setMargin('0 auto');
    progressbar.setColor('black');
    progressbar.setFontSize('30px');
    panel.add(progressbar);

    var bar = new UI.Row();
    bar.setWidth('0%');
    bar.setHeight('100%');
    bar.setBackgroundColor('#1DBB37');
    progressbar.add(bar);

    loadScheme("../",
        function() {
            bar.setWidth('100%');
            setTimeout(function(){
                panel.dom.remove();
                new IDE();
            }, 100);
        }, 
        function(cur, max) {
            var percent = cur / max * 100;
            bar.setWidth(percent + '%');
        });
}

new Loader();



