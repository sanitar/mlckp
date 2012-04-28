$(document).ready(function(){
    var ws = $('#workspace');

    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g
    };

    var DirectoryView = Backbone.View.extend({
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

    var directory = new DirectoryView();
});
