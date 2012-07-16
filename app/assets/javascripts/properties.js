Mock.namespace('Mock.props');

Mock.props.Panel = Mock.extend(null, {
    tpls: {
        'text': Handlebars.compile('<input name="{{opt}}" />'),
        'select': Handlebars.compile('<select><option>opt1</option></select>'),
        'textarea': Handlebars.compile('<textarea name="{{opt}}"></textarea>')
    },

    initialize: function(o){
        $.extend(this, o);
        this.$el = $('#props_panel');
        this.tpl_param = Handlebars.compile($('#params-item-template').html());
        this.$el.draggable({
            containment: 'parent'
        });
    },

    clear: function(){
        this.$el.find('.props-params table tr').remove();
        this.$el.find('.props-initial input').val('');
        //this.$el.find('table tbody tr').remove();
    },

    renderInitial: function(els, ui){
        var $el = this.$el.find('.props-initial');
        $el.find('td:nth-child(3n), td:nth-child(4n)', 'table tr').toggle(!ui.has_group);

        var w = 0, h = 0, x = 0, y = 0;
        for (var i = 0; i < els.length; i++){
            var el = $(els[i]),
                pos = el.position();
            if (i == 0){
                w = el.width();
                h = el.height();
                x = pos.left;
                y = pos.top;
                continue;
            }
            if (!w && !h && !x && !y) break;
            if (w != el.width()) w = undefined;
            if (h != el.height()) h = undefined;
            if (x != pos.left) x = undefined;
            if (y != pos.top) y = undefined;
        }
        $el.find('table td input[name="x"]').val(x || '');
        $el.find('table td input[name="y"]').val(y || '');
        $el.find('table td input[name="w"]').val(w || '');
        $el.find('table td input[name="h"]').val(h || '');

    },

    renderParameters: function(ui){
        console.log(ui);
        var $el = this.$el.find('.props-params');
        $el.find('table tbody').html('');
        if (ui.has_group) {
            $el.find('.no-props').toggle(true);
            return;
        }

        if (!ui.similar){
            $el.find('.no-props').toggle(true);
            return;
        }
        var params = $.parseJSON(ui.element.params);
        $el.find('.no-props').toggle(params ? false : true);
        if (!params) return;

        for (var i = 0; i < params.length; i++){
            this.renderParam(params[i]);
        }
    },

    render: function(models, els){
        var ui = {};

        ui.models = models.length ? true: false;
        if (ui.models){
            var attrs,
                similar = models[0].attributes['element_id'];

            // check if similar
            for (var i = 0; i < models.length; i++){
                attrs = models[i].attributes;
                if (similar !== attrs['element_id']){
                    ui.similar = false;
                }
                if (attrs['is_group']){
                    ui.has_group = true;
                }
            }
            if (ui.similar == undefined){
                ui.similar = true;
                ui.element_id = similar;
            }
            ui.has_group = ui.has_group || false;

            // check if exist this element
            if (ui.element_id){
                var elements = Mock.data.elements;
                for (var i = 0; i < elements.length; i++){
                    if (ui.element_id == elements[i].id){
                        ui.element = elements[i];
                        break;
                    }
                }
            }
        }

        this.$el.find('table').toggle(ui.models);
        this.$el.find('.no-props').toggle(!ui.models);
        if (!ui.models) return;
        this.clear();

        this.renderInitial(els, ui);
        this.renderParameters(ui);
    },

    renderParam: function(param){
        if (!this.tpls[param.type]) {
            console.log('param "', param.type, '" is absent');
            return;
        }
        param.tpl = this.tpls[param.type](param);
        var tpl = this.tpl_param(param);
        this.$el.find('.props-params table tbody').append($(tpl));
    }
})