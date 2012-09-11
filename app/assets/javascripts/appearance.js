Mock.namespace('Mock.menu');

Mock.menu.ContextMenu = Mock.extend(null, {
    initialize: function(){

    }
});

Mock.menu.Menu = Mock.extend(null, {
    rootDomSelector: '.navbar .nav',
    menu: [],

    initialize: function(o){
        $.extend(this, o);
        this.root = $(this.rootDomSelector);
        this.render();
        this.renderDropdownMenu();
//        this.renderContextMenu();
    },

    render: function(){
        var tpl = Handlebars.compile($('#menu-left-template').html()),
            toolbarHtml = [];
        for (var i = 0; i < this.menu.length; i++){
            toolbarHtml.push( $(this.menu[i]).map(function(index, item){
                return {
                    item: item,
                    tooltip: item.split('_').slice(1).join(' ')
                }
            }).toArray() );
        }
        var toolbar = $(tpl({menu: toolbarHtml}));
        this.root.append(toolbar);
        this.root.find('li[data-menu]').click(this.fireEvent.createDelegate(this));
    },

    renderDropdownMenu: function(){
        var tpl = Handlebars.compile($('#menu-right-template').html()),
            root = this.root.parent().append(tpl),
            li = root.find('li.dropdown'),
            menu = li.find('.dropdown-menu');

        li.click(function(){
            li.toggleClass('open');
            menu.toggle(li.hasClass('open'));
            if (li.hasClass('open')){
                $('html').one('click', function(e){
                    li.removeClass('open');
                    menu.hide();
                })
            }
            return false;
        });

        li.find('.dropdown-menu').click(function(e){
            e.stopPropagation();
        });
        li.settings();
    },

//    renderContextMenu: function(){
//        var self = this,
//            ws = $('#workspace'),
//            el = $('.context_menu'),
//            lis = el.find('li:not(.divider)'),
//            pasteEl = el.find('li[data-menu="menu_paste"]');
//
//        ws.on('contextmenu', function(event){
//            el.addClass('open').css({
//                left: event.pageX,
//                top: event.pageY
//            });
//
//            lis.toggleClass('disabled', ws.find('.ui-selected').length == 0);
//
//            pasteEl.toggleClass('disabled', Mock.buffer.get() === undefined);''
//
//            $('body').one('mousedown', function(e){
//                el.removeClass('open');
//            });
//            return false;
//        });
//        el.find('li:not(.divider, .dropdown-submenu)').mousedown(function(e){
//            if (!$(this).hasClass('disabled')) self.fireEvent(e, this);
//        });
//    },

    fireEvent: function(e, el){
        var attr = $(el).attr('data-menu');
        if (attr) $(this).trigger(attr, { el: $(el), event: e});
    }
});

/* --------------------- wokspace ------------------------ */
(function($) {
    $.widget("ui.workspace", {
        options: {
        },
        _create: function(){
            var o = this.options,
                data = Mock.data.project;
            $.extend(o, $.parseJSON(data.settings));
            o.width = data.width;
            o.height = data.height;

            var grid = o.snapToGrid ? [parseInt(o.gridWidth, 10), parseInt(o.gridHeight, 10)] : false;


            this.element.uiselectable({
                filter: '.block:not(.group-block), .group:not(.group-block)'
            })
                .multidraggable({
                    filter: '.block:not(.group-block), .group:not(.group-block)',
                    dragOptions: {
                        containment: 'parent',
                        grid: grid,
                        snapToGrid: true,
                        snapToObjects: true,
                        snapToObjectsTolerance: 10,
                        cancel: null
                    }
                });

            this.initGrid();
            this.renderGrid();
        },

        _setOption: function(option, value, s1){
            this.options[option] = value;
            if(option == 'width'){
                this.element.css({ width: value + 'px' });
                this.grid_canvas[0].width = parseInt(value, 10);
                this.renderGrid();
            }
            if (option == 'height'){
                this.element.css({ height: value + 'px' });
                this.grid_canvas[0].height = parseInt(value, 10);
                this.renderGrid();
            }
            if (option == 'showGrid' || option == 'snapToGrid' || option == 'gridHeight' || option == 'gridWidth'){
                this.renderGrid();
            }
        },

        initGrid: function(){
            this.grid_canvas = $('<canvas id="canvasGrid" width="' + this.options.width + '" height="' + this.options.height + '"></canvas>');
            this.element.append(this.grid_canvas);
            this.grid_context = this.grid_canvas[0].getContext("2d");
            this.renderGrid();
        },

        renderGrid: function(){
            var ws = this.element,
                w = ws.width(),
                h = ws.height(),
                context = this.grid_context,
                row_w = parseInt(this.options.gridWidth, 10),
                row_h = parseInt(this.options.gridHeight, 10);

            context.clearRect(0, 0, w, h);

            if (this.options.showGrid == true){
                var count = 0;
                for (var x = 0.5; x < w; x += row_w) {
                    context.beginPath();
                    context.moveTo(x, 0);
                    context.lineTo(x, h);
                    if (count % 5 == 0) context.strokeStyle = "#d9d9d9";
                        else context.strokeStyle = "#f2f2f2";
                    context.stroke();
                    context.closePath();
                    count++;
                }
                count = 0;
                for (var y = 0.5; y < h; y += row_h) {
                    context.beginPath();
                    context.moveTo(0, y);
                    context.lineTo(w, y);
                    if (count % 5 == 0) context.strokeStyle = "#d9d9d9";
                        else context.strokeStyle = "#f2f2f2";
                    context.stroke();
                    context.closePath();
                    count++;
                }
            }
            var draggableEls = this.element.find('.ui-draggable'),
                grid = this.options.snapToGrid ? [row_w, row_h] : false;
            draggableEls.draggable('option', 'grid', grid);
            Mock.data.project.snapToGrid = this.options.snapToGrid;
            Mock.data.project.gridWidth = this.options.gridWidth;
            Mock.data.project.gridHeight = this.options.gridHeight;
            var dragOptions = this.element.multidraggable('option', 'dragOptions');
            dragOptions['grid'] = grid;
            this.element.multidraggable('option', 'dragOptions', dragOptions);
        }
    });
}(jQuery));

/* --------------------- settings ------------------------ */
(function($) {
    $.widget("ui.settings", {
        els: {},
        settings: {},
        _create: function(){
            var el = this.element,
                data = Mock.data.project;

            this.ws = $('#workspace');

            this.settings = $.parseJSON(data.settings);
            this.settings.width = data.width;
            this.settings.height = data.height;
            for (var setting in this.settings){
                var setEl = el.find('[name="' + setting + '"]');
                this.els[setting] = setEl;
                setEl.on('change', this._dataChanged.createDelegate(this));
                setEl.is(':checkbox') ? setEl.attr('checked', this.settings[setting]) : setEl.val(this.settings[setting]);
            }
        },

        _dataChanged: function(e, el){
            var name = $(el).attr('name'),
                val = $(el).is(':checkbox') ? $(el).is(':checked') : $(el).val();
            this.settings[name] = val;
            this._saveData();
            this.ws.workspace('option', name, val);
        },

        _saveData: function(){
            var settings = {};
            for (var name in this.settings){
                if (name !== 'width' && name !== 'height') settings[name] = this.settings[name];
            }
            $.ajax({
                type: 'POST',
                data: {
                    id: Mock.data.project.id,
                    project: {
                        width: this.settings.width,
                        height: this.settings.height,
                        settings: JSON.stringify(settings)
                    }
                },
                url: 'update/params'
            });
        }
    });
})(jQuery);