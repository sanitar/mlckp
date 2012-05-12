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
            this.controller = new Mock.MocksController();

            ws
                .uiselectable({
                    filter: '.block'
                })
                .multidraggable({
                    filter: '.block',
                    dragOptions: {
                        containment: '#workspace',
                        distance: 3,
                        cancel: null,
                        grid: [5, 5]
                    }
                });
            ws.on('multidraggablestop', this.onDragStop.createDelegate(this));

            /*$('#navigation > div').splitter({
                type: 'h',
                sizeTop: true,
                accessKey:"P"
            });*/

            this.menu = new Mock.menu.Menu({
                menu: [
                    ['menu_undo', 'menu_redo'],
                    ['menu_duplicate', 'menu_remove'],
                    ['menu_align_right', 'menu_align_center', 'menu_align_left',
                        'menu_align_bottom', 'menu_align_middle', 'menu_align_top'],
                    ['menu_move_forwards', 'menu_move_backwards', 'menu_move_front', 'menu_move_back'],
                    ['menu_layers_group', 'menu_layers_ungroup']
                ]
            });

            this.pages = new Mock.page.PageController({
                collection: pageCollection
            });
            this.pages.on('route:load', this.controller.fetch.createDelegate(this.controller));
            Backbone.history.start();

            $('#groups .groups-content > p').each(function(index, item){
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
        },

        onDragStop: function(e, el, ui){
            this.controller.save();
        }
    });

    var directory = new DirectoryView();
});
