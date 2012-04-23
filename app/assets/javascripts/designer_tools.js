$(document).ready(function(){
    var cl = console.log;
    // переопределение шаблонизатора underscore
    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g
    };

    // модели
    var BlockModel = Backbone.Model.extend({ // Модель пользователя
    });

    // коллекции
    var BlocksCollection = Backbone.Collection.extend({ // Коллекция пользователей
        url: 'blocks',
        model: BlockModel
    });

    // индивидуальные вьюхи
    var BlockView = Backbone.View.extend({
        template: _.template($("#block-template").html()),

        events: {
          "click .btn-delete"  : "onDeleteBlock"
        },

        initialize: function(options){
            this.el_model = options.el_model;
            this.directory = options.parent;
            this.render();
            if (this.model.isNew()){
                this.onChange();
            }
        },

        render: function(){
            var self = this;
            this.el = $(this.template(this.el_model.toJSON()));
            this.$el = $(this.el);
            this.$el.attr('id', 'block-' + this.cid);

            this.el.addClass(this.el_model.attributes.css);

            this.el.css({
               left: this.model.get('positionx'),
               top: this.model.get('positiony'),
               position: 'absolute'
            });
            if (this.model.get('width') !== undefined){
                this.el.width(this.model.get('width'));
            }
            if (this.model.get('height') !== undefined){
                this.el.height(this.model.get('height'));
            }

            $('.workspace').append(this.el);

            $(this.el).draggable({
                containment: '.workspace',
                stop: function(){
                    self.onChange.apply(self, []);
                }
            }).resizable({
                containment: '.workspace',
                stop: function(){
                    self.onChange.apply(self, []);
                }
            });
            $(this.el).hover(this.onHoverIn, this.onHoverOut);

            return this;
        },

        onChange: function(){
            var self = this,
                pos = $(this.el).position();

            this.model.set({
                'positionx': pos.left,
                'positiony': pos.top,
                'width': $(this.el).width(),
                'height': $(this.el).height()
            });
            this.updateSaveLabel(true);
            this.model.save([],{
                success: function(){
                    self.updateSaveLabel(false);
                }
            });
        },

        updateSaveLabel:function(saving){
           $('.nav-info').html(saving == true ? 'Сохранение...' : 'Все изменения сохранены');
        },

        onHoverIn: function(e){
            $(this).find('.ui-icon-gripsmall-diagonal-se').show();
            $(this).find('.btn-controls').show();

        },

        onHoverOut: function(e){
            $(this).find('.ui-icon-gripsmall-diagonal-se').hide();
            if (!$(this).hasClass('selected')){
                $(this).find('.btn-controls').hide();
            }
        },

        onDeleteBlock: function(e){
            var self = this;
            this.model.destroy({
                success: function(){
                    self.remove();
                    $(self.el).unbind();
                }
            })
        }
    });

    // класс объектов для перетаскивания
    var DragObjects = function(){
        var dragObjects = [],
            multipleDrag = false,
            startPosition;
        return {
            cls: 'selected',

            init: function(){
                var self = this;
                $('.block').live({
                    'click': function(e){
                        self.onClick.apply(self, [e, this]);
                    },
                    'dragstart': function(e){
                        self.onDragStart.apply(self, [e, this]);
                    },
                    'drag': function(e, ui){
                        if (multipleDrag){
                            self.onMultipleDrag.apply(self, [e, this, ui]);
                        }
                    },
                    'dragstop': function(e){
                        multipleDrag = false;
                    }
                });
                $('.workspace').live('click', function(e){
                    self.onWorkspaceClick.apply(self, [e, this]);
                });
            },

            clear: function(){
                $(dragObjects).removeClass(this.cls);
                dragObjects = [];
            },

            remove: function(el){
                dragObjects = $.grep(dragObjects, function(item){
                    return item !== el;
                });
                $(el).removeClass(this.cls);
            },

            add: function(el){
                dragObjects.push(el);
                $(el).addClass(this.cls);
            },

            hasEl: function(el){
                return $.inArray(el, dragObjects) !== -1;
            },

            onClick: function(e, el){
                var len = dragObjects.length,
                    has = this.hasEl(el);
                if (e.ctrlKey){
                    this[has ? 'remove' : 'add'](el);
                } else {
                    this.clear();
                    if ((has && len > 1) || !has){
                        this.add(el);
                    }
                }
                e.stopPropagation();
                return false;
            },

            onWorkspaceClick: function(e, el){
                if (!e.ctrlKey){
                    this.clear();
                }
            },

            onDragStart: function(e, el){
                if (this.hasEl(el)){
                    if (dragObjects.length > 1){
                        multipleDrag = true;
                        startPosition = $(el).position();
                    }
                } else {
                    this.clear();
                    this.add(el);
                }
            },

            onMultipleDrag: function(e, el, ui){
                var pos = $(el).position(),
                    shiftTop = pos.top - startPosition.top,
                    shiftLeft = pos.left- startPosition.left;

                $(dragObjects).each(function(index, item){
                    if (item != el){
                        pos = $(item).position();
                        $(item).css({
                            left: pos.left + shiftLeft,
                            top: pos.top + shiftTop
                        })
                    }
                });
                startPosition = $(el).position();
            }
        }
    }

    // главная вьюха
    var DirectoryView = Backbone.View.extend({
        el: $("#groups"),

        initialize: function () {
            var self = this;
            this.drag_stack = new DragObjects();
            this.drag_stack.init();
            this.elements = allElements;
            this.blocks = new BlocksCollection();
            this.initEvents();
        },

        initEvents: function(){
            var self = this;
            this.blocks.fetch({
                success: function(){
                    self.onSuccess();
                }
            });

            $('a.groups-header').on('click', this.toggleGroupHeader);
            $('.groups-content > p').each(function(index, item){
                var el = self.elements.get(parseInt(this.id.replace('el','')));
                $(this).draggable({
                    cursorAt: {
                        left: 10,
                        top: 10
                    },
                    helper: function(e){
                        return $('<div class="block"><div class="content">' + el.attributes.html + '</div></div>').addClass(el.attributes.css);
                    },
                    stop: function(e, ui){
                        var size = $('.workspace').offset();
                        if ((e.pageX-10) > size.left && (e.pageY-10) > size.top){
                            self.renderBlock(e, ui, el.attributes);
                        }
                    }
                });
            });
        },

        onSuccess: function(blocks, arr){
            var self = this;
            this.blocks.each(function(item, index){
                var blockView = new BlockView({
                    model: item,
                    el_model: self.elements.get(item.attributes['element_id'])
                });
            });
        },

        renderBlock: function(e, ui, attrs){
            var self = this,
                ws = $('.workspace'),
                left = e.pageX - ws.offset().left - 12,
                top = e.pageY - ws.offset().top - 12;

            var item = this.blocks.add([{
                element_id: attrs.id,
                positionx: left,
                positiony: top
            }]).last();

            var blockView = new BlockView({
                model: item,
                el_model: this.elements.get(attrs.id)
            });
        }
    });

    //create instance of master view
    var directory = new DirectoryView();
});