Mock.namespace('Mock.element.params');

// список начальных параметров
Mock.element.params.Initial = Mock.extend(null, {
    values: null,
    initialize: function(o){
        $.extend(this, o);
        this.$el = $('#initial');
        this.initEvents();
    },

    initEvents: function(){
        this.els = {
            r: this.$el.find('input[name="r"]'),
            x: this.$el.find('input[name="x"]'),
            y: this.$el.find('input[name="y"]'),
            w: this.$el.find('input[name="w"]'),
            h: this.$el.find('input[name="h"]')
        }
        this.$el.find('input[name="r"], input[name="x"], input[name="y"]').on('click', this.onClickResizable.createDelegate(this));
        this.$el.find('input:checkbox').on('click', this.update.createDelegate(this));
        this.$el.find('input:not(:checkbox)').on('blur', this.update.createDelegate(this));
    },

    load: function(initial){
        this.values = initial;
        for (var name in initial){
            if (name == 'r'){
                this.$el.find('input[name="x"]').attr('checked', initial[name].x);
                this.$el.find('input[name="y"]').attr('checked', initial[name].y);
            } else {
                var el = this.$el.find('input[name="' + name + '"]');
                el.is(':checkbox') ? el.attr('checked', initial[name]) : el.val(initial[name])
            }
        }
        this.updateResizable();
    },

    update: function(e, el){
        var el = $(el),
            name = el.prop('name'),
            has_changes = false,
            values = this.values;
        if (name == 'r' || name == 'x' || name == 'y'){
            var x_val = this.$el.find('input[name="x"]').is(':checked'),
                y_val = this.$el.find('input[name="y"]').is(':checked');
            if (values.r.x !== x_val || values.r.y !== y_val) {
                values.r.x = x_val;
                values.r.y = y_val;
                has_changes = true;
            }
        } else {
            var val = el.is(':checkbox') ? el.is(':checked') : el.val();
            if (values[name] !== val){
                values[name] = val;
                has_changes = true;
            }
        }
        if (has_changes){
            $(this).trigger('update', { initial: JSON.stringify(this.values) });
        }
    },

    updateResizable: function(){
        var r_el = this.$el.find('input[name="r"]'),
            x_el = this.$el.find('input[name="x"]'),
            y_el = this.$el.find('input[name="y"]'),
            resizable = x_el.is(':checked') || y_el.is(':checked');
        r_el.attr('checked', resizable);
        x_el.parents('tr').toggle(resizable);
        y_el.parents('tr').toggle(resizable);
    },

    onClickResizable: function(e, el){
        if ($(el).prop('name') == 'r'){
            var tr = $(el).parents('tr').next();
            tr.find('input').attr('checked', $(el).is(':checked'));
            tr.next().find('input').attr('checked', $(el).is(':checked'));
        }
        this.updateResizable();
    }
});

// диалог для добавления/редактирования дополнительных параметров
Mock.element.params.ParametersDialog = Mock.extend(Mock.dialog.Dialog, {
    options: {
        titlePrefix: 'parameter',
        dialogConfig: { minWidth: 350 },
        form: {
            'name': 'Name',
            'opt': 'Option name',
            'type': {
                type: 'select',
                label: 'Type',
                options: ['text', 'textarea', 'checkbox', 'select', 'images', 'colorPicker']
            }
        }
    },

    required: {
        select: {
            vals: { type: 'list',   label: 'Values' },
            def: {  type: 'number', label: 'Default value' }
        },
        colorPicker: {
            def: { type: 'colorfield', label: 'Default color' }
        },
        defaults: { def: { type: 'text', label: 'Default value' } }
    },

    additional: {
        text: {
            is_number: { type: 'checkbox', label: 'Number field' }
        }
    },

    initialize: function(){
        this.selectTypeEl = this.$el.find('select[name="type"]').get(0);
        $(this.selectTypeEl).change(this.changeType.createDelegate(this));
    },

    show: function(){
        this.changeType(null, this.selectTypeEl);
        this.uber.show.apply(this, arguments);
    },

    changeType: function(e, el){
        var self = this,
            val = $(el).val(),
            required = this.required[val],
            additional = this.additional[val] || {};

        if (!required){
            required = this.required.defaults;
            required.def.type = val;
        }

        this.fields = this.fields.slice(0, 3);
        var tbody = this.$el.find('table tbody');
        tbody.find('tr:gt(2)').remove();
        tbody.append(this.renderConfig(required));

        if (!$.isEmptyObject(additional)){
            tbody.append('<tr><td></td><td class="td-more-info"><a href="#">More</a></td></tr>');
            $('<tr><td colspan="2"><hr /></td></tr>').hide().appendTo(tbody);
            this.renderConfig(additional).hide().appendTo(tbody);
            $('<tr><td></td><td class="td-less-info"><a href="#">Less</a></td></tr>').hide().appendTo(tbody);
            tbody.find('td.td-more-info a').click(function(){
                $(this).parents('tr').hide().nextAll().css('display', 'table-row');
                return false;
            });
            tbody.find('td.td-less-info a').click(function(){
                tbody.find('tr:has(.td-more-info)').css('display', 'table-row').nextAll().hide();
                return false;
            });
        }
    },

    setValues: function(values){
        for (var i in values){
            var el = this.$el.find('[name="'+ i +'"]');
            var field = $.findInArray(this.fields, function(item, index){
                return el.get(0) == item.el.get(0);
            });
            if (field == -1) continue;

            var fn = this.types[field.config.type].set;
            fn ? fn.apply(el, [values[i]]) : el.val(values[i]);

            if (i == 'type'){
                this.changeType(null, el.get(0));
            }
        }
    }
});

Mock.element.params.List = Mock.extend(null, {
    values: [],
    initialize: function(o){
        $.extend(this, o);
        this.initComponents();
        this.initEvents();
    },

    initEvents: function(){
        this.$el.find('.icon-plus').click(this.onAddClick.createDelegate(this));
        $(this.dialog).on('save', this.save.createDelegate(this));
        this.$el.find('table tr').live({
            'mouseenter': function(){
                $(this).find('span').show();
            },
            'mouseleave': function(){
                $(this).find('span').hide();
            }
        });
        this.$el.find('table tr .icon-pencil').live('click', this.onEditClick.createDelegate(this));
        this.$el.find('table tr .icon-trash').live('click', this.onRemoveClick.createDelegate(this));
    },

    load: function(values){
        this.$el.find('table tbody').html('');
        this.values = values || [];
        for (var i = 0; i < this.values.length; i++){
            this.renderParam(this.values[i]);
        }
    },

    onAddClick: function(){
        this.dialog.add();
    }
});


// список дополнительных параметров для элемента
Mock.element.params.Parameters = Mock.extend(Mock.element.params.List, {
    initComponents: function(){
        this.$el = $('#parameters');
        this.dialog = new Mock.element.params.ParametersDialog();
        this.tpl = Handlebars.compile($('#parameter-item-template').html());
    },

    renderParam: function(config){
        if ($.isNumeric(config)){
            var index = config;
            config = this.values[index];
            var el = $(this.tpl(config));
            this.$el.find('table tr').eq(index).after(el).remove();
        } else {
            $(this.tpl(config)).appendTo(this.$el.find('table tbody'));
        }
    },

    onEditClick: function(e, el){
        var index = this.$el.find('tr').index($(el).parents('tr').get(0));
        this.editValue = this.values[index];
        this.dialog.edit(this.values[index]);
    },

    onRemoveClick: function(e, el){
        var index = this.$el.find('tr').index($(el).parents('tr').get(0)),
            config = this.values[index];
        if (confirm('Do you really want to delete parameter "'+ config.name + '"?')){
            this.values.splice(index, 1);
            this.$el.find('table tr').eq(index).remove();
            $(this).trigger('update', { params: JSON.stringify(this.values) });
        }
    },

    save: function(e, opts, dialog){
        var changes = false;
        if (dialog.mode == 'add'){
            this.values.push(opts);
            changes = true;
            this.renderParam(opts);
        } else {
            if (this.editValue != opts){
                changes = true;
                var index = $.inArray(this.editValue, this.values);
                this.values[index] = opts;
                this.renderParam(index);
            }
        }
        if (changes){
            $(this).trigger('update', { params: JSON.stringify(this.values) });
        }
    }
});

// список зависимостей для элементов
Mock.element.params.Dependencies = Mock.extend(Mock.element.params.List, {
    initComponents: function(){
        this.$el = $('#dependencies');
        this.tpl = Handlebars.compile($('#dependency-item-template').html());
        this.dialog = new Mock.dialog.Dialog({
            titlePrefix: 'dependency',
            dialogConfig: { minWidth: 350 },
            form: {
                dependencies: 'Dependency'
            }
        });
    },

    renderParam: function(config){
        if ($.isNumeric(config)){
            var index = config;
            config = this.values[index];
            var el = $(this.tpl({ dependencies: config }));
            this.$el.find('table tr').eq(index).after(el).remove();
        } else {
            $(this.tpl({ dependencies: config })).appendTo(this.$el.find('table tbody'));
        }
    },

    save: function(e, opts, dialog){
        opts = opts.dependencies;
        var changes = false;
        if (dialog.mode == 'add'){
            this.values.push(opts);
            changes = true;
            this.renderParam(opts);
        } else {
            if (this.editValue != opts){
                changes = true;
                var index = $.inArray(this.editValue, this.values);
                this.values[index] = opts;
                this.renderParam(index);
            }
        }
        if (changes){
            $(this).trigger('update', { dependencies: JSON.stringify(this.values) });
        }
    },

    onEditClick: function(e, el){
        var index = this.$el.find('tr').index($(el).parents('tr').get(0));
        this.editValue = this.values[index];
        this.dialog.edit({ dependencies: this.values[index] });
    },

    onRemoveClick: function(e, el){
        var index = this.$el.find('tr').index($(el).parents('tr').get(0)),
            url = this.values[index];
        if (confirm('Do you really want to delete this dependency \n\r"'+ url + '"?')){
            this.values.splice(index, 1);
            this.$el.find('table tr').eq(index).remove();
            $(this).trigger('update', { dependencies: JSON.stringify(this.values) });
        }
    }
});

// общий контроллер для всех параметров
Mock.element.params.Controller = Mock.extend(null, {
    initialize: function(o){
        $.extend(this, o);
        this.initComponents();
        this.initEvents();
    },
    initComponents: function(){
        this.$el = $('#params');
        this.initial = new Mock.element.params.Initial();
        this.parameters = new Mock.element.params.Parameters();
        this.dependencies = new Mock.element.params.Dependencies();
    },
    initEvents: function(){
        $(this.initial).on('update', this.updateValues.createDelegate(this));
        $(this.parameters).on('update', this.updateValues.createDelegate(this));
        $(this.dependencies).on('update', this.updateValues.createDelegate(this));
        this.$el.find('i.icon-chevron-down, i.icon-chevron-right').click(function(){
            $(this).parents('li').find('table').toggle($(this).hasClass('icon-chevron-right'));
            $(this).toggleClass('icon-chevron-down icon-chevron-right');
        });
    },

    load: function(model){
        if (model){
            this.initial.load($.parseJSON(model.get('initial')));
            this.parameters.load($.parseJSON(model.get('params')));
            this.dependencies.load($.parseJSON(model.get('dependencies')));
        }
    },

    updateValues: function(e, changeset){
        $(this).trigger('update', changeset);
    },

    toggle: function(enable){
        this.$el.toggle(enable);
    }
});