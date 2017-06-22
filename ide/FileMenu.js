var FileMenu = function(ide) {
    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent(window.localeBundle.getString('File'));
    container.add(title);

    var items = new UI.Panel();
    items.setClass('menuitems');
    container.add(items);

    var openItem = new UI.Row();
    openItem.setClass('menuitem');
    openItem.setTextContent(window.localeBundle.getString('Open'));
    openItem.onClick(function(){
        var fileUpload = document.getElementById('file');
        if(fileUpload == null) {
            fileUpload = document.createElement('input');
            fileUpload.id = 'file';
            fileUpload.type = 'file';
            fileUpload.onchange = function() {
                if(!this.files.length)
                    return;
                var file = this.files[0];
                var reader = new FileReader();
                reader.onload = function() {
                    ide.editor.setValue(this.result);
                };
                reader.readAsText(file);
            };
            document.body.appendChild(fileUpload);
        }
        fileUpload.click();
    });
    items.add(openItem);

    var saveItem = new UI.Row();
    saveItem.setClass('menuitem');
    saveItem.setTextContent(window.localeBundle.getString('Save'));
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
