$(document).ready(function(){
    var ws = $('#workspace');

    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g
    };

    /*var DragObjects = function(){
        var dragCfg = {
            offset: {},
            objs: []
        };
        return {
            cls: 'ui-selected',

            init: function(){
                var self = this;
                ws.selectable({
                    filter: '.block',
                    'stop': function(e, ui){
                        console.log('select ends', ui);
                    }
                });
                $('.block').live({
                    'click': function(e){
                        $(this).toggleClass(self.cls);
                    },

                    'dragstart': function(e){
                        if ($(this).hasClass('ui-selected')){
                            dragCfg.objs = $('.ui-selected', '#workspace');
                            dragCfg.objs.each(function(item){
                                var el = $(this);
                                el.data("offset", el.offset());
                            });
                            dragCfg.objs = dragCfg.objs.not(this);
                            dragCfg.offset = $(this).offset();
                        }  else {
                            dragCfg.objs = [];
                        }
                    },

                    'drag': function(e, ui){
                        if (dragCfg.objs.length > 0){
                            self.onMultipleDrag.apply(self, [e, this, ui]);
                        }
                    },
                    'dragstop': function(e, ui){
                        console.log('drag stop');
                        $(self).trigger('dragstop', [dragCfg.objs]);
                    }
                });
            },

            onMultipleDrag: function(e, el, ui){
                var dt = ui.position.top - dragCfg.offset.top,
                    dl = ui.position.left - dragCfg.offset.left,
                    w = ws.width(), h = ws.height();

                $(dragCfg.objs).each(function(){
                   var el = $(this),
                       off = el.data('offset'),
                       left = off.left + dl,
                       top = off.top + dt,
                       x_max = w - el.width(),
                       y_max = h - el.height();

                   el.css({
                      top: top < 0 ? 0 : (top > y_max ? y_max : top),
                      left: left < 0 ? 0 : (left > x_max ? x_max : left)
                   });
                });
            }
        }
    }*/


    var DirectoryView = Backbone.View.extend({
        el: $("#groups"),

        initialize: function () {
            var self = this;
            this.blocks = new Mock.BlocksCollection();
            this.controllers = [];
            this.drag_stack = new Mock.DragObjects();
            this.drag_stack.init();
            this.elements = allElements;
            this.initEvents();
        },

        initEvents: function(){
            var self = this;
            this.blocks.fetch({
                success: function(){
                    self.onSuccess();
                }
            });

            $(this.drag_stack).on('dragstop', function(e, objs){
                self.onDragStop.apply(self, [objs]);
            });

            $('#navigation').draggable({
                axis: 'x',
                containment: 'parent'
            });

            $('a.groups-header').on('click', function(e){
                $(this).parent().find('.groups-content').toggle();
            });
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
                        var size = ws.offset();
                        if ((e.pageX-10) > size.left && (e.pageY-10) > size.top){
                            self.renderBlock(e, ui, el.attributes);
                        }
                    }
                });
            });
            $('#master-panel').draggable({
                containment: 'parent'
            });
            $('#master-panel .mini-btn').on('click', function(){
                self.hideMasterPanel.apply(self);
            });

            $('.block .btn-select').live('click', function(e){
                self.showMasterPanel.apply(self);
            });
        },

        onSuccess: function(blocks, arr){
            var self = this;
            this.blocks.each(function(item, index){
                self.createBlock(item);
            });
        },

        createBlock: function(model){
            var blockView = new Mock.BlockView({
                model: model,
                template: _.template($("#block-template").html()),
                el_model: this.elements.get(model.attributes['element_id'])
            });

            var controller = new Mock.BlockController({
                model: model,
                view: blockView
            });
            this.controllers.push(controller);
        },


        renderBlock: function(e, ui, attrs){
            var self = this,
                left = e.pageX - ws.offset().left - 10,
                top = e.pageY - ws.offset().top - 10;

            var item = this.blocks.add([{
                element_id: attrs.id,
                positionx: left,
                positiony: top
            }]).last();

            this.createBlock(item);
        },

        onDragStop: function(objs){
            for (var i = 0, len1 = objs.length; i < len1; i++){
                var id = objs[i].id.replace('block-', '');
                for (var j = 0, len2 = this.controllers.length; j < len2; j++){
                    if (id == this.controllers[j].view.cid){
                        this.controllers[j].savePosition();
                    }
                }
            }
        },
        hideMasterPanel: function(){
          $('#master-panel').hide();
        },
        showMasterPanel: function(){
            var mp = $('#master-panel');
            if (!mp.is(':visible')){
                $('#master-panel').show().css({
                    left: $('#workspace').width() - 200,
                    top: '10px'
                });
            }
        }
    });

    var directory = new DirectoryView();
});
