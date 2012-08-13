$(document).ready(function(){
    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g
    };

    $('input.input-number').live({
        'keydown': function(e){
            var key = e.keyCode,
                val;
            if (!e.altKey && !e.ctrlKey && key != 46 && key != 8 && key != 9 && key != 37 && key != 39 && (key < 48 || key > 57 )) {
                e.preventDefault();
            }
            if (key == 38){ // up key
                val = parseInt($(this).val(), 10);
                $(this).val(val + 1);
            }
            if (key == 40){ //down key
                val = parseInt($(this).val(), 10);
                val = val == 0 ? val : (val - 1);
                $(this).val(val);
            }
        }
    });
    /* --- list component --- */
    $('div.list-item').live({
        'mouseenter': function(){
            $(this).find('input').addClass('focused');
            $(this).find('i').show();
        },
        'mouseleave': function(){
            $(this).find('input').removeClass('focused');
            $(this).find('i').hide();
        }
    });
    $('div.list a').live({
        'click': function(){
            var el = $('<div class="list-item"><input type="text" /><i class="icon-trash" style="display: none;"></i></div>');
            $(this).before(el);
            el.find('input').focus();
        }
    });
    $('div.list i').live({
        'click': function(){
            $(this).parents('div.list-item').remove();
        }
    });
});

Mock.init = {};

/* --------------------------------------------- */
/* ----------------- developer ------------------ */

Mock.init.developer = function(){
    var ws = $('#workspace');

    var DirectoryView = Mock.extend(null, {
        initialize: function(){
            this.initComponents();
            this.initEvents();
            Backbone.history.start();

            ws.splitter({
                type: 'v'
            });

            $('#navigation > div').splitter({
                type: 'h',
                sizeTop: true,
                accessKey:"P"
            });
        },

        initComponents: function(){
            this.controller = new Mock.element.Controller();
            this.iframe = $('#result iframe');
            this.iframe_loader = $('.ajax-loader-container');
        },

        loadIframe: function(url){
            if (url !== '' || url !== this.iframe.attr('src')){
                this.iframe_loader.show();
                $('.alert').toggle(false);
                this.iframe.attr('src', url);
            }
        },

        onRoute: function(){
            var element_id = document.location.hash.substring(1);
            this.loadIframe('');
            $('.alert').toggle(element_id ? true : false);
        },

        initEvents: function(){
            this.controller.on('route:load', this.onRoute.createDelegate(this));
            var self = this;

            // Run button
            $('.navbar .btn').click(function(){
                self.loadIframe('elements/result/' + document.location.hash.substring(1));
            });

            this.iframe.on('load', function(){
                self.iframe_loader.hide();
            });
        }
    });

    var directory = new DirectoryView();
}

/* --------------------------------------------- */
/* ----------------- designer ------------------ */

Mock.init.designer = function(){
    var ws = $('#workspace');

    var DirectoryView = Mock.extend(null, {
        initialize: function(){
            this.initComponents();
            this.initEvents();

            $('#groups a:first').tab('show');
//            this.toggleTabs();

            $('#navigation').draggable({
                axis: 'x'
            });
        },

        initComponents: function(){
            this.controller = new Mock.BlockGroupComposite();

            ws.uiselectable({
                filter: '.block:not(.group-block), .group:not(.group-block)',
                stop: this.controller.reloadPropsPanel.createDelegate(this.controller)
            })
                .multidraggable({
                    filter: '.block:not(.group-block), .group:not(.group-block)',
                    dragOptions: {
                        containment: '#workspace',
                        distance: 3,
                        cancel: null,
                        grid: [5, 5],
                        snap: true
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

//            $('.menu_undo, .menu_redo').css({
//                opacity: '0.6'
//            })

            this.pages = new Mock.page.Controller();

            $('#navigation > div').splitter({
                type: 'h',
                sizeTop: true,
                accessKey:"P"
            });
        },

        initEvents: function(){
            ws.on('multidraggablestop', this.onDragStop.createDelegate(this));

            this.pages.on('route:load', this.changePage.createDelegate(this));
            Backbone.history.start();

            $('#groups .tab-pane > div').each(function(index, item){
                var id = parseInt(this.id.replace('el', ''), 10),
                    el = $.grep(Mock.data.elements, function(item){
                        return id == item.id;
                    })[0],
                    params = $.parseJSON(el.initial);

                $(this).draggable({
                    cursorAt: {
                        left: 10,
                        top: 10
                    },
                    helper: function(e){
                        return $('<div class="block"><div class="content mock-'+ el.id +'">' + el.html + '</div></div>')
                            .css({
                                width: params.w,
                                height: params.h
                            });
                    }
                });
            });

            $(this.menu).on('menu_layers_group menu_layers_ungroup', this.onGroupAction.createDelegate(this));
            $(this.menu).on('menu_move_forwards menu_move_backwards menu_move_front menu_move_back', this.onMoveAction.createDelegate(this));
            $(this.menu).on('menu_duplicate menu_remove', this.onEditAction.createDelegate(this));
            $(this.menu).on('menu_align_right menu_align_center menu_align_left \
                             menu_align_bottom menu_align_middle menu_align_top', this.onAlignAction.createDelegate(this));
            $(this.menu).on('menu_edit menu_review', this.onPreviewAction.createDelegate(this));
            $(this.menu).on('menu_undo menu_redo', this.onHistoryAction.createDelegate(this));


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

        onPreviewAction: function(e, el){
            el = $(el);
            var preview = el.is('[data-menu="menu_review"]');
            if (el.hasClass('active')) return;

            el.siblings('.editreview').andSelf().toggleClass('active');
            el.parent().find('[data-menu]:not(.editreview)').toggle(!preview);
            $('#navigation, #props_panel').toggle(!preview);
            ws.children('.block').find('.content').trigger(preview ? 'review' : 'edit');
        },

        onHistoryAction: function(e, el){
            var type = e.type.split('_')[1];
        },

        changePage: function(page_num, el){
            var isPage = $.isNumeric(page_num);
            this.controller.fetch(page_num);
            $('#groups, #navigation .hsplitbar').toggle(isPage);
        },

        onDragStop: function(e, el, ui){
            this.controller.update($('.ui-selected'));
        }
    });

    var directory = new DirectoryView();
}

/* ------------------------------------------------------- */
/* ----------------- developer - result ------------------ */

Mock.init.developer_result = function(){
    var ws = $('#workspace');

    var DirectoryView = Mock.extend(null, {
        initialize: function(){
            $('html').addClass('developer_result');
            this.initComponents();
        },

        initComponents: function(){
            var elements = Mock.data.elements;
            if (elements.length){
                var element = elements[0],
                    initial = $.parseJSON(element.initial);

                var block_data = {
                    element_id: element.id,
                    id: element.id,
                    is_group: false,
                    params: '{"x":10,"y":10,"w":' + initial.w + ',"h":' + initial.h + '}',
                    parent_id: null,
                    z_index: 1
                };

                var model = new Backbone.Model(block_data);

                var view = new Mock.block.BlockView({
                    model: model
                });
                view.$el.draggable({
                    containment: 'parent'
                });
            }
        }
    });

    var directory = new DirectoryView();
}