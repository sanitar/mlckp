Mock.properties = {};
Mock.properties.panel = {};
Mock.properties.fields = {};

// common class
Mock.properties.fields.Field = Mock.extend(null, {
    tpl: '',
    saveAction: 'change',
    events: 'blur change focus keyup keydown keypress click dblclick',
    initialize: function(o){
        $.extend(this, o);
        this.tpl = Handlebars.compile(this.tpl);
        this.render();
        this.initEvents();
    },

    render: function(){
        this.$el = $(this.tpl(this.value)).appendTo(this.root);
    },

    initEvents: function(){
        this.$el.on(this.events, this.trigger.createDelegate(this));
    },

    get: function(){
        return this.$el.val();
    },

    set: function(val){
        this.$el.val(val);
        this.value = val;
    },

    trigger: function(e, el){
        if (this.saveAction == e.type){
            $(this).trigger('save', { type: e.type, el: el, val: this.get() });
            this.value = this.get();
        }
        $(this).trigger('action', { type:e.type, el: el, val: this.get() });
    },

    remove: function(){
        if (this.value !== this.get()){
            $(this).trigger('save', { type: this.saveAction, el: this.$el.get(0), val: this.get() });
        }
        this.$el.unbind();
        $(this).unbind();
        this.$el.parents('tr').remove();
    }
});

Mock.properties.fields.TextField = Mock.extend(Mock.properties.fields.Field, {
    tpl: '<input name="{{opt}}" class="{{#if is_number}}input-number{{/if}}"/>',
    events: 'change focus keyup'
});
Mock.properties.fields.SelectField = Mock.extend(Mock.properties.fields.Field, {
    tpl: '<select><option></option>{{#each vals}}<option>{{this}}</option>{{/each}}</select>',
    events: 'change',
    render: function(){
        this.uber.render.apply(this);
        this.$el.chosen({ allow_single_deselect: true });
    },
    set: function(val){
        this.$el.val(val).trigger("liszt:updated");
        this.value = val;
    }
});
Mock.properties.fields.TextareaField = Mock.extend(Mock.properties.fields.Field, {
    tpl: '<textarea name="{{opt}}"></textarea>'
});
Mock.properties.fields.CheckboxField = Mock.extend(Mock.properties.fields.Field, {
    tpl: '<input name="{{opt}}" type="checkbox" />',
    events: 'change click',
    set: function(val){
        this.$el.attr('checked', val);
        this.value = val;
    },
    get: function(){
        return this.$el.is(':checked');
    }
});

Mock.properties.fields.ColorpickerField = Mock.extend(Mock.properties.fields.Field, {
    tpl: '<div><div class="input-append"><input name="{{opt}}" class="input-colorpicker"/><span class="add-on"><i class="icon-colorpicker"></i></span></div></div>',
    saveAction: 'colorchange',
    events: 'change blur colorchange colorupdate',
    render: function(){
        this.uber.render.apply(this);
        this.inputEl = this.$el.find('input');
        this.inputEl.colorPicker();
        return this.$el;
    },
    trigger: function(e, el){
        if (this.saveAction == e.type){
            $(this).trigger('save', { type: e.type, el: el, val: this.get() });
            this.value = this.get();
        }
        var val = e.type == 'colorupdate' ? this.inputEl.colorPicker('option', 'color')
            : this.get();
        $(this).trigger('action', { type:e.type, el: el, val: val });
    },
    set: function(val){
        this.inputEl.colorPicker('option', 'color', val);
        this.value = val;
    },
    get: function(){
        return this.inputEl.val();
    },
    remove: function(){
        this.inputEl.colorPicker('hide');
        this.uber.remove.apply(this);
    }
});

/* ---------- parameters --------- */
var pr = Mock.properties.fields;
Mock.properties.panel.Parameters = Mock.extend(null, {
    types: {
        text: pr.TextField,
        select: pr.SelectField,
        textarea: pr.TextareaField,
        colorPicker: pr.ColorpickerField,
        checkbox: pr.CheckboxField
    },

    initialize: function(){
        this.$el = $('#props_panel .props-params');
        this.fields = {};
        this.trTpl = Handlebars.compile($('#params-item-template').html());
    },

    render: function(ui, els){
        this.$el.find('.no-props').toggle(!ui.similar || ui.has_group || !ui.element);
        if (!ui.element) return;
        this.selected = els;
        var params = $.parseJSON(ui.element.params);
        if (!params) return;
        for (var i = 0; i < params.length; i++){
            this.renderParam(params[i], ui.values);
        }
    },

    renderParam: function(param, values){
        if (!this.types[param.type]) {
            console.log('param "', param.type, '" is absent');
            return;
        }

        var field = new this.types[param.type]({
                value: param,
                defaultValue: param.def,
                root: $(this.trTpl(param)).appendTo(this.$el.find('table tbody')).find('td:last')
            });

        this.fields[param.opt] = field;
        $(field).on('action', this.onAction.createDelegate(this));
        $(field).on('save', this.onSave.createDelegate(this));
        var val = values[param.opt];
        val = (!val && val !== '' && val !== false) ? param.def : val;
        field.set(val);

    },

    onSave: function(e, ui, field){
        var params = {};
        for (var i in this.fields){
            var field = this.fields[i];
            if (field.defaultValue != field.get()){
                params[i] = this.fields[i].get();
            }
        }
        this.selected.trigger('save', { custom_params: JSON.stringify(params) });
    },

    onAction: function(e, ui, field){
        var name = '';
        for (var i in this.fields){
            name = this.fields[i] == field ? i: name;
        }
        this.selected.find('.content').trigger(name + '.' + ui.type, ui.val);
    },

    clear: function(){
        for (var i in this.fields){
            this.fields[i].remove();
        }
        this.fields = {};
    }
});

/* ---------- size and position --------- */
Mock.properties.panel.SizeAndPosition = Mock.extend(null, {
    initialize: function(){
        this.$el = $('#props_panel .props-initial');
        this.$els = {
            x: this.$el.find('input[name="x"]'),
            y: this.$el.find('input[name="y"]'),
            w: this.$el.find('input[name="w"]'),
            h: this.$el.find('input[name="h"]')
        }
        this.setValues({});
        this.initEvents();
    },

    initEvents: function(){
        var self = this;
        for (var i in this.$els){
            this.$els[i].keyup(function(){
                var val = parseInt($(this).val(), 10),
                    name = $(this).attr('name');
                if (name == 'x')  self.selected.css({ left: val });
                if (name == 'y')  self.selected.css({ top: val });
                if (name == 'w')  self.selected.width(val);
                if (name == 'h')  self.selected.height(val);
            });

            this.$els[i].blur(function(){
                var vals = { params: JSON.stringify(self.getValues()) };
                self.selected.trigger('save', vals);
            });
        }
    },

    render: function(ui, els){
        // toggle position if has_group
        this.selected = els;
        this.$el.find('td:nth-child(3n), td:nth-child(4n)', 'table tr').toggle(!ui.has_group);

        var w = 0, h = 0, x = 0, y = 0;
        for (var i = 0; i < els.length; i++){
            var el = $(els[i]),
                pos = el.position(),
                size = { w: el.width(), h: el.height() };
            x = i == 0 ? pos.left : (x != pos.left ? null : x);
            y = i == 0 ? pos.top : (y != pos.left ? null : y);
            w = i == 0 ? size.w : (y != size.w ? null : w);
            h = i == 0 ? size.h : (h != size.h ? null : h);
            if (!w && !h && !x && !y) break;
        }
        this.setValues({ x: x, y: y, w: w, h: h });
    },

    setValues: function(obj){
        for (var i in this.$els){
            this.$els[i].val(obj[i] || '');
        }
    },

    getValues: function(){
        var vals = {};
        for (var i in this.$els){
            vals[i] = parseInt(this.$els[i].val(), 10);
        }
        return vals;
    },

    clear: function(){
        this.setValues({});
    }
});

Mock.properties.panel.MagicSearch = Mock.extend(null, {
    initialize: function(o){
        this.$el = $('#props_panel .magic-search');
        this.chooseEl = this.$el.find('table select');
        this.searchEl = this.$el.find('input');
        this.searchResultEl = this.$el.find('.search-result');
        this.initEvents();
    },

    initEvents: function(){
        this.$el.find('span').click(this.search.createDelegate(this));
        this.$el.find('input').keyup(this.onKeyUp.createDelegate(this));
    },

    render: function(ui, el){
        this.$el.find('.input-append').show();
        this.searchResultEl.show();
    },

    clear: function(){
        this.searchEl.val('').parents('.input-append').hide();
        this.searchResultEl.html('').hide();
    },

    onKeyUp: function(e, el){
        if (e.which == 13) this.search();
    },

    search: function(){
        var val = this.chooseEl.val();
        $.ajax({
            url: 'http://www.searchmash.com/results/images:cat',
            success: function(s1, s2, s3){
                console.log('success!!', s1,s2, s3);
            },
            error: function(s1, s2, s3){
                console.log('error!!', s1,s2, s3);
            }
        });
        if (val == 'Text'){

        }
        if (val == 'Images'){

        }
        console.log('search', val);
    }
});

/* ---------- controller --------- */
Mock.properties.Controller = Mock.extend(null, {
    initialize: function(){
        this.$el = $('#props_panel');
        this.panels = [
            new Mock.properties.panel.SizeAndPosition(),
            new Mock.properties.panel.Parameters(),
            new Mock.properties.panel.MagicSearch()
        ];
        this.make(function(){
            this.$el.children().hide();
            this.$el.find('.no-props').show();
        })
    },

    make: function(f){
        for (var i = 0; i < this.panels.length; i++){
            f.apply(this.panels[i]);
        }
    },

    render: function(models, els){
        var ui = {
            models: models.length ? true: false,
            similar: true,
            has_group: false,
            element_id: null,
            element: null,
            values: {}
        };

        this.make(function(){ this.clear(); })

        for (var i = 0; i < models.length; i++){
            var id = models[i].get('element_id');
            if (!id) ui.has_group = true;
            if (i == 0) {
                ui.element_id = id;
            }
            if (id !== ui.element_id) ui.similar = false;

            if (ui.similar && !ui.has_group){
                var cp = $.parseJSON(models[i].get('custom_params'));

                for (var j in cp){
                    var cpj = ui.values[j];
                    if (cpj === undefined){
                        ui.values[j] = cp[j];
                    } else {
                        ui.values[j] = cpj == cp[j] ? cpj : null;
                    }
                }
            }
        }

        if (ui.similar && ui.element_id > 0){
            ui.element = $.findInArray(Mock.data.elements, function(item, index){
                return item.id == ui.element_id;
            });
            var params = {},
                cp = $.parseJSON(ui.element.params);
            if (cp){
                for (var i = 0; i < cp.length; i++){
                    params[cp[i].opt] = ui.values[cp[i].opt] === undefined ? cp[i].def : ui.values[cp[i].opt];
                }
            }
        }

        this.$el.find('table').toggle(ui.models);
        this.$el.find('.no-props').toggle(!ui.models);
        if (!ui.models) return;

        this.make( (function(ui, els){
            return function(){
                this.render(ui, els); }
        }(ui, els)) );
    }
});
