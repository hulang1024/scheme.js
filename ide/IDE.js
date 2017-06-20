var IDE = function() {
    var ide = this;

    this.signals = {
        mainPanelSizeChanged: new signals.Signal()
    };

    var editor = new Editor(ide);
    ide.editor = editor;

    var replConsole = new REPLConsole(ide);
    ide.replConsole = replConsole;
    scheme.console = replConsole; 

    var menuBar = new Menubar(ide);
    ide.menuBar = menuBar;
    document.body.appendChild(menuBar.dom);

    var toolBar = new ToolBar(ide);
    ide.toolBar = toolBar;
    document.body.appendChild(toolBar.dom);

    var container = new UI.Panel();
    container.setId('content');
    container.add(editor);
    container.add(replConsole);

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


    document.body.appendChild(panel.dom);

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



