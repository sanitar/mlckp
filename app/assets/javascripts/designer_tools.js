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
            this.controller = new Mock.Controller();
            this.selections = new Mock.Selections({
                blocks: this.controller.controllers
            });

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

            this.pages = new Mock.menu.Pages({
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
        }
    });

    var directory = new DirectoryView();

/*    var DirectoryView = Backbone.View.extend({
        el: $("#groups"),

        initialize: function () {
            var self = this;
            this.controller = new Mock.Controllers({
                elements: allElements
            });
            this.elements = allElements;
            this.initEvents();
        },

        initEvents: function(){
            var self = this;

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
                            self.renderNewBlock(e, ui, el.attributes);
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
            $('#master-panel li').click(function(e){
                self.transformSelection.apply(self, [e, this]);
            });

            $('.block .btn-select').live('click', function(e){
                self.showMasterPanel.apply(self);
            });
        },

        renderNewBlock: function(e, ui, attrs){
            var left = e.pageX - ws.offset().left - 10,
                top = e.pageY - ws.offset().top - 10;

            this.controller.models.add([{
                element_id: attrs.id,
                positionx: left,
                positiony: top
            }]);
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
        },
        transformSelection: function(e, el){
            var self = this,
                id = $(el).attr('id').replace('el-mp', '');
                selections = this.controller.selections.get();

            if (selections.size() > 0){
                $(selections).each(function(index, item){
                    self.controller.findModel(item).set({
                        'element_id': parseInt(id, 10)
                    });
                });
            }
        }
    });

    var directory = new DirectoryView();*/
});
