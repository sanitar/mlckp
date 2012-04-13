var groups = [
    {label: 'Элементы страницы', id: '1'},
    {label: 'Блочные элементы', id: '0'},
    {label: 'Виджеты', id: '2'}
];

var elements = [{
    group: '0', 
    label: 'Блок', 
    tag: 'div', 
    html: '<div>Блок текста</div>'
},{
    group: '0', 
    label: 'Цитата', 
    tag: 'blockquote', 
    html: '<blockquote><p>Цитата</p><small>Готовая цитата</small></blockquote>',
    css: {
        width: '200px',
        height: '50px'
    }
},{
    group: '0', 
    label: 'Заголовок', 
    tag: 'h1', 
    html: '<h1>Заголовок 1-го уровня</h1>'
},{
    group: '0', 
    label: 'Разделитель', 
    tag: 'hr', 
    html: '<hr />'
},{
    group: '0', 
    label: 'Абзац', 
    tag: 'p', 
    html: '<p>Абзац длинной в бесконечность</p>'
},{
    group: '0', 
    label: 'Моноширинный текст', 
    tag: 'pre', 
    html: '<pre class="prettyprint linenums">Моноширинный текст - или куски кода \n\r Ещё что-то...</pre>'
},{
    group: '1', 
    label: 'Простой блок', 
    tag: 'div', 
    html: '<div>Простой блочный элемент</div>',
    css: {
        backgroundColor: '#ccc',        
        width: '200px',
        height: '100px',
        borderRadius: '5px'
    }        
},{
    group: '1', 
    label: 'Текстовый элемент', 
    tag: 'input', 
    html: '<input type="text" place_holder="type some" />',
    css: {
        width: '250px',
        height: '20px'
    }
},{
    group: '2', 
    label: 'Календарь', 
    html: '<div></div>'
},{
    group: '2', 
    label: 'Скролл', 
    html: '<div></div>'
},{
    group: '2', 
    label: 'Время', 
    html: '<div></div>'
}];
