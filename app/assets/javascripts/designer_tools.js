$(document).ready(function(){    
    // переопределение шаблонизатора underscore
    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g
    };
    
    // модели
    var GroupModel = Backbone.Model.extend({ });
    
    var ElementModel = Backbone.Model.extend({
        defaults: {
            tooltip: 'Подсказка',
            tag: 'div',
            css: {}
        }
    });
    
    var BlockModel = Backbone.Model.extend({ // Модель пользователя
        defaults: {
            innerHtml: '<div></div>'
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
    
    // индивидуальные вьюхи
    var GroupView = Backbone.View.extend({
        tag: 'div',
        events: {
            'click a': 'onClick'
        },
        template: $("#group-template").html(),
        render: function(){
            var tmpl = _.template(this.template);
            $(this.el).html(tmpl(this.model.toJSON()));
            return this;
        },
        onClick: function(e, el){
            this.$el.find('.groups-content').toggle();
        }
    });
    
    var ElementView = Backbone.View.extend({
        template: $("#element-template").html(),        
        render: function(){
            this.model.set('id', _.uniqueId(''));
            var tmpl = _.template(this.template);
            $(this.el).html(tmpl(this.model.toJSON()));
            return this;            
        }
    });
    
    var BlockView = Backbone.View.extend({
        template: $("#block-template").html(),
        render: function(){
            this.model.set('id', _.uniqueId(''));
            var tmpl = _.template(this.template);
            this.el = $(tmpl(this.model.toJSON())).draggable({
                containment: '.workspace'
            }).resizable({
                containment: '.workspace'
            }).hover(this.onHoverIn, this.onHoverOut);
            return this;
        },
        onHoverIn: function(e){
            $(this).find('.ui-icon-gripsmall-diagonal-se').show();
        },
        onHoverOut: function(e){
            $(this).find('.ui-icon-gripsmall-diagonal-se').hide();
        }
    });
    
    // главная вьюха
    var DirectoryView = Backbone.View.extend({
        el: $("#groups"),

        initialize: function () {
            this.groups = new GroupsCollection(groups);
            this.elements = new ElementsCollection(elements);
            this.blocks = new BlocksCollection([]);
            this.render();
        },

        render: function () {
            var self = this;
            _.each(this.groups.models, function(item){
                self.renderGroup(item);
            }, this);
            _.each(this.elements.models, function(item){
                self.renderElement(item);
            }, this);
        },
        
        renderGroup: function(item){
            var groupView = new GroupView({
                model: item
            });
            this.$el.append(groupView.render().el);
        },
        
        renderElement: function(item){
            var elementView = new ElementView({
                model: item
            });
            this.$el.find('#group' + item.attributes.group).append(elementView.render().el);
            this.eventElement(elementView, item);
        },
        
        eventElement: function(elementView, item){
            var self = this;
            elementView.$el.draggable({
                cursorAt: {
                    left: 10,
                    top: 10
                },
                helper: function(e){
                    return $(item.attributes.html).css(item.attributes.css);
                },
                stop: function(e, ui){
                    var size = $('.workspace').offset();
                    if ((e.pageX-10) > size.left && (e.pageY-10) > size.top){
                        self.renderBlock(e, ui, item.attributes);
                    }
                }
            });
        },
        renderBlock: function(e, ui, attrs){
            var item = this.blocks.add([{
                form_id: attrs.id,
                innerHtml: attrs.html
            }]).last();
            var blockView = new BlockView({
                model: item
            });
            var block = blockView.render().el;
            var ws = $('.workspace');
            ws.append(block);
            $(block).css($.extend(attrs.css, {
                left: e.pageX - ws.offset().left - 12,
                top: e.pageY - ws.offset().top - 12
            }));
        }
    });

    //create instance of master view
    var directory = new DirectoryView();
});