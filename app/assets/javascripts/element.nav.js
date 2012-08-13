Mock.namespace('Mock.element.nav');
// диалог добавления и редактирования названия элемента
Mock.element.nav.Dialog = Mock.extend(Mock.dialog.Dialog, {
    options: {
        titlePrefix: 'element',
        dialogConfig: { minWidth: 350 },
        form: {
            'name': 'Name',
            'description': {
                type: 'textarea',
                label: 'Description'
            }
        }
    }
});

Mock.element.nav.View = Backbone.View.extend({
    events: {
        'click .icon-pencil': 'clickEdit',
        'click .icon-trash': 'clickDelete'
    },

    initialize: function(o){
        $.extend(this, o);
        this.model.on('change:name', this.onChangeName.createDelegate(this));
        this.model.on('remove', this.onModelRemove.createDelegate(this));
        this.render();
    },

    render: function(){
        var template = _.template($('#element-item-template').html());

        this.$el = $(template(this.model.toJSON()));
        this.el = this.$el.get()[0];
        this.root.append(this.el);

        this.$el.hover(function(){
            $(this).find('span').toggle();
        });
    },

    clickEdit: function(){
        $(this).trigger('editelement', [this, this.model]);
        return false;
    },

    clickDelete: function(){
        $(this).trigger('deleteelement', [this, this.model]);
        return false;
    },

    onChangeName: function(model, text, changes){
        var el = this.$el.find('a'),
            html = el.html();
        html = html.substring(html.indexOf('<span'), html.length - 1);
        el.html(text + html);
    },

    onModelRemove: function(){
        this.remove();
        this.$el.unbind();
    }
});

Mock.element.nav.Controller = Mock.extend(null, {
    initialize: function(o){
        $.extend(this, o);
        this.$el = $('#element ul');
        this.initComponents();
        this.initEvents();
        this.render();
    },

    initComponents: function(){
        this.views = new Mock.Collection();
        this.dialog = new Mock.element.nav.Dialog();
    },

    initEvents: function(){
        $(this.dialog).on('save', this.save.createDelegate(this));
        $('#element .icon-plus').click(this.onAddClick.createDelegate(this));
    },

    render: function(){
        var self = this;
        this.collection.each(function(item, index){
            self.createView(item);
        });
    },

    createView: function(model){
        var view = new Mock.element.nav.View({
            model: model,
            root: this.$el
        });
        this.views.add(view);
        $(view).bind('editelement', this.onEditClick.createDelegate(this));
        $(view).bind('deleteelement', this.onRemoveClick.createDelegate(this));
    },

    onAddClick: function(){
        this.dialog.add();
    },

    onEditClick: function(e, view, model){
        this.editModel = model;
        this.dialog.edit(model.attributes);
    },

    onRemoveClick: function(e, view, model){
        if (confirm('Do you really want to delete element "'+ model.attributes.name + '"?')){
            this.collection.remove(model);
            this.collection.save();
            $(this).trigger('remove', model);
        }
    },

    save: function (e, conf, dialog){
        var self = this;
        if (dialog.mode == 'add'){
            conf['element_group_id'] = 1;
            this.collection.add(conf).last();
            this.collection.save({
                'success': function(model, data){
                    self.createView(model[0]);
                }
            });
        } else {
            this.editModel.set(conf);
            this.collection.save();
        }
    },

    select: function(element_id){
        $('#element ul li').removeClass('active');
        $('#el' + element_id).addClass('active');
    }
});