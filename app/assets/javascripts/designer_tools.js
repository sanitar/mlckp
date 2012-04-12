$(document).ready(function(){    
    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g
    };
    
    // Модель группы элементов
    var GroupModel = Backbone.Model.extend({
        defaults: {
            label: 'default',
            id: ''
        },
        initialize: function(data, el){            
            $('.groups').append(_.template($('#group-template').html(), data));
        }
    });
    
    // Модель элементов
    var ElementModel = Backbone.Model.extend({ // Модель пользователя
        defaults: {
            id: '',
            group: '',
            label: "",
            html: '<div></div>'
        },
        initialize: function(data, el){
            $('#groupt'+data['group']).append(_.template($('#element-template').html(), data));            
        }
    });    
    
    // Модель блоков
    var BlockModel = Backbone.Model.extend({ // Модель пользователя
        defaults: {
            id: '',
            form_id: '',
            innerHtml: '<div></div',
            width: 300,
            height: 200
        },
        initialize: function(data, el){
            this.set('id', _.uniqueId());
            console.log(this.get('id'), this.attributes);
            $('.workspace').append(_.template($('#block-template').html(), this.attributes));
            $('#block' + this.get('id')).draggable({containment: 'parent'}).resizable({containment: 'parent'});
            console.log(data, this);
        }
    });
    
    // коллекции
    var GroupsCollection = Backbone.Collection.extend({ // Коллекция пользователей
        model: GroupModel
    });

    var ElementsCollection = Backbone.Collection.extend({ // Коллекция пользователей
        model: ElementModel
    });
    
    var BlocksCollection = Backbone.Collection.extend({ // Коллекция пользователей
        model: BlockModel
    });
    
    // вьюха рабочей области
    var BlocksView = Backbone.View.extend({
        el: $("[id^=block]"), // DOM элемент widget'а
        initialize: function () { // Подписка на событие модели
            this.model.bind('change', this.render, this);
        },
        render: function(){
            console.log('render blobk');
        }
    });

    // инициализация моделей и коллекций:
    var groups = new GroupsCollection([
        {label: 'Элементы формы', id: '0'},
        {label: 'Элементы страницы', id: '1'},
        {label: 'Виджеты', id: '2'}
    ]);
    
    var elements = new ElementsCollection([   
        { group: '0', label: 'Text form', html: '<input type="text" style="" />', id: 0, height: 50 },
        { group: '0', label: 'Radio', html: '<input type="radio" value="Radio btn" />Radio btn', id: 1, height: 30 },
        { group: '0', label: 'Checkbox', html: '<input type="checkbox" value="Checkbox">', id: 2, height: 30, width: 200 },

        { group: '1', label: 'Карты', html: '<div style="width: 100px; height: 100px; background-color: white;">Это карта!!!</div>', id: 3 },
        { group: '1', label: 'Абзац', html: '<p>Абзац с кучей текста</p>', id: 4},
        { group: '1', label: 'Блок', html: '<div style="border: 1px solid gray; padding: 2px;">Пример блока</div>', id: 5},

        { group: '2', label: 'Календарь', html: '<div></div>', id: 6},
        { group: '2', label: 'Скролл', html: '<div></div>', id: 7},
        { group: '2', label: 'Время', html: '<div></div>', id: 8}
    ]);
    
    var blocks = new BlocksCollection();
    var bv = new BlocksView({ model: blocks });  
    
    $('.groups-header').click(function(e){        
        $(this).parent().find('.groups-content').toggle();
    });
    
    $('.groups-content p').click(function(e){
        var attr = elements.get(this.id.split('el')[1]).attributes;
        console.log(attr);
        blocks.add([{ 'form_id': attr.id, 'innerHtml': attr.html, 'width': attr.width, 'height': attr.height }]);
    });
    
    $('.block').live('mouseenter', function(e){
        console.log('hover');
        $('.controls', this).toggle();
    });
    $('.block').live('mouseleave', function(e){
        console.log('hover');
        $('.controls', this).toggle();
    });
    /*, function(e){
        console.log('ubhover');
        $('.controls', this).toggle();
    });*/

});