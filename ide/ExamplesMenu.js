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
        {title: 'SICP chapter2', file: 'ch2.scm'},
        {title: 'SICP chapter2 support', file: 'ch2support.scm'},
        {title: 'SICP chapter2 tests', file: 'ch2tests.scm'},
        {title: 'SICP chapter3', file: 'ch3.scm'},
        {title: 'SICP chapter3 support', file: 'ch3support.scm'},
        {title: 'SICP chapter4', file: 'ch4.scm'},
        {title: 'SICP chapter4 meta circular evaluator', file: 'ch4-mceval.scm'},
        {title: 'SICP chapter4 analyzing meta circular evaluator', file: 'ch4-analyzingmceval.scm'},
        {title: 'SICP chapter4 lazy evaluator', file: 'ch4-leval.scm'},
        {title: 'SICP chapter4 amb evaluator', file: 'ch4-ambeval.scm'},
        {title: 'SICP chapter4 query system', file: 'ch4-query.scm'},
        {title: 'SICP chapter5', file: 'ch5.scm'},
        {title: 'SICP chapter5 syntax', file: 'ch5-syntax.scm'},
        {title: 'SICP chapter5 register machine simulator', file: 'ch5-regsim.scm'},
        {title: 'SICP chapter5 simulation of ec-eval machine operations', file: 'ch5-eceval-support.scm'},
        {title: 'SICP chapter5 explicit control evaluator', file: 'ch5-eceval.scm'},
        {title: 'SICP chapter5 eceval-compiler', file: 'ch5-eceval-compiler.scm'},
        {title: 'SICP chapter5 compiler', file: 'ch5-compiler.scm'},
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
                    req.open('GET', 'https://raw.githubusercontent.com/hulang1024/Lisp-programs/raw/master/scheme/tests/SICP/' + itemProp.file, true);
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
