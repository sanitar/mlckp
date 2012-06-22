$(document).ready(function(){
    var dir = this,
        ws = $('#workspace');

    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g
    };

    var DirectoryView = Mock.extend(null, {
        initialize: function(){
            dir = this;
            this.initComponents();
            this.initEvents();

            $('#groups a:first').tab('show');
            this.toggleTabs();

            $('#navigation').draggable({
                axis: 'x'
            });
        },

        initComponents: function(){
            this.controller = new Mock.BlockGroupComposite();

            ws.uiselectable({
                    filter: '.block:not(.group-block), .group:not(.group-block)'
                })
                .multidraggable({
                    filter: '.block:not(.group-block), .group:not(.group-block)',
                    dragOptions: {
                        containment: '#workspace',
                        distance: 3,
                        cancel: null,
                        grid: [5, 5]
                    }
                });
            this.menu = new Mock.menu.Menu({
                menu: [
                    ['menu_undo', 'menu_redo'],
                    ['menu_duplicate', 'menu_remove'],
                    ['menu_align_bottom', 'menu_align_middle', 'menu_align_top',
                        'menu_align_right', 'menu_align_center', 'menu_align_left'],
                    ['menu_move_forwards', 'menu_move_backwards', 'menu_move_front', 'menu_move_back'],
                    ['menu_layers_group', 'menu_layers_ungroup']
                ]
            });
            $('.menu_undo, .menu_redo, .editreview').css({
                opacity: '0.6'
            })

            this.pages = new Mock.page.Controller({
                collection: pageCollection,
                prefix: 'page'
            });

            $('#navigation > div').splitter({
                type: 'h',
                sizeTop: true,
                accessKey:"P"
            });
        },

        initEvents: function(){
            ws.on('multidraggablestop', this.onDragStop.createDelegate(this));

            this.pages.on('route:load', this.controller.fetch.createDelegate(this.controller));
            this.pages.on('route:load', this.toggleTabs);
            this.pages.on('deletepages', this.toggleTabs);
            Backbone.history.start();

            $('#groups .tab-pane > div').each(function(index, item){
                var el = allElements.get(parseInt(this.id.replace('el','')));
                $(this).draggable({
                    cursorAt: {
                        left: 10,
                        top: 10
                    },
                    helper: function(e){
                        return $('<div class="block"><div class="content">' + el.attributes.html + '</div></div>').addClass(el.attributes.css);
                    }
                });
            });

            $(this.menu).on('menu_layers_group menu_layers_ungroup', this.onGroupAction.createDelegate(this));
            $(this.menu).on('menu_move_forwards menu_move_backwards\
                            menu_move_front menu_move_back',
                            this.onMoveAction.createDelegate(this));
            $(this.menu).on('menu_duplicate menu_remove',
                            this.onEditAction.createDelegate(this));
            $(this.menu).on('menu_align_right menu_align_center menu_align_left \
                             menu_align_bottom menu_align_middle menu_align_top',
                            this.onAlignAction.createDelegate(this));

            var timer = undefined;
            $('#navigation .nav-info').ajaxStart(function(e){
               $(this).text('Сохранение...')
            });

            $('#navigation .nav-info').ajaxStop(function(){
               var el = $(this);
               if (timer) return;
               timer = setTimeout((function(el){
                   return function(){ el.text('Все изменения сохранены.'); timer = undefined; };
               }(el)), 1000);
            });
        },

        onEditAction: function(e, el){
            if (e.type == 'menu_remove'){
                this.controller.remove($('.ui-selected'));
            }
            if (e.type == 'menu_duplicate'){
                this.controller.duplicate($('.ui-selected'));
            }
        },

        onGroupAction: function(e){
            if (e.type == 'menu_layers_group'){
                this.controller.group($('.ui-selected'));
            }
            if (e.type == 'menu_layers_ungroup'){
                this.controller.ungroup($('.ui-selected'));
            }
        },

        onAlignAction: function(e){
            var els = $('.ui-selected');
            els.align(e.type);
            this.controller.save(els);
        },

        onMoveAction: function(e){
            var selected = $('.ui-selected');
            if (selected.length < 1) return;
            $('.ui-selected').zindexchange(e.type);
            this.controller.updateZIndex();
        },

        toggleTabs: function(){
            var pages = $('#page .active');
            if (pages.size() > 0){
                $('#groups, #navigation .hsplitbar').show();
            } else {
                $('#groups, #navigation .hsplitbar').hide();
            }
        },

        onDragStop: function(e, el, ui){
            var sel = $('.ui-selected');
            this.controller.update(sel);
        }
    });

    var directory = new DirectoryView();
});

