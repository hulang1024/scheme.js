var FileMenu = function(ide) {
    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent(localeBundle.getString('File'));
    container.add(title);

    var items = new UI.Panel();
    items.setClass('menuitems');
    container.add(items);

    var openItem = new UI.Row();
    openItem.setClass('menuitem');
    openItem.setTextContent(localeBundle.getString('Open'));
    openItem.onClick(function() {
        var fileUpload = document.getElementById('file');
        if(fileUpload == null) {
            fileUpload = document.createElement('input');
            fileUpload.id = 'file';
            fileUpload.type = 'file';
            fileUpload.addEventListener('change', function() {
                ide.editor.loadFile(this.files);
            });
            document.body.appendChild(fileUpload);
        }

        fileUpload.click();
    });
    items.add(openItem);

    var saveItem = new UI.Row();
    saveItem.setClass('menuitem');
    saveItem.setTextContent(localeBundle.getString('Save'));
    saveItem.onClick(function(){
        var output = ide.editor.getValue();

        var blob = new Blob( [ output ], { type: 'text/plain;charset=utf8' } );
        var objectURL = URL.createObjectURL( blob );

        window.open( objectURL, '_blank' );
        window.focus();
    });
    items.add(saveItem);
    
    return container;
}
