Mock.namespace('Mock.page');

Mock.page.PageModel = Backbone.Model.extend({
});

Mock.page.PageCollection = Backbone.Collection.extend({
    url: 'pages/',
    model: Mock.page.PageModel
});

Mock.page.PageView = Backbone.View.extend({
    tpl_id: '#page-item-template',
    rootSelector: '#pages ul',
    events: {
        'click .icon-pencil': 'clickEdit',
        'click .icon-trash': 'clickDelete'
    },

    initialize: function(){
        this.root = $(this.rootSelector);
        this.model.on('change:name', this.onChangeName.createDelegate(this));
        this.model.on('destroy', this.onModelRemove.createDelegate(this));
        this.render();
    },
    render: function(){
        var template = _.template($(this.tpl_id).html());
        this.$el = $(template(this.model.toJSON()));
        this.el = this.$el.get()[0];
        this.root.append(this.el);

        this.$el.hover(function(e, el){
            $(this).find('span').toggle();
        });
    },

    clickEdit: function(){
        $(this).trigger('editpage', [this, this.model]);
        return false;
    },

    clickDelete: function(){
        $(this).trigger('deletepage', [this, this.model]);
        return false;
    },

    onChangeName: function(s1, s2, s3){
        this.$el.find('a').text(s2);
    },

    onModelRemove: function(){
        this.remove();
        this.$el.unbind();
    }
});

Mock.page.PageController = Backbone.Router.extend({
    routes: {
        ':page': 'load'
    },

    initialize: function(o){
        $.extend(this, o);
        this.views = new Mock.Collection();
        this.dialog = new Mock.page.Dialog();

        $(this.dialog).on('save', this.save.createDelegate(this));
        $('#pages .icon-plus').click(this.onAddPageClick.createDelegate(this));
        this.render();
    },

    render: function(){
        var self = this;

        this.collection.each(function(item, index){
            self.createView(item);
        });
    },

    createView: function(model){
        var view = new Mock.page.PageView({
            model: model
        });
        this.views.add(view);
        $(view).bind('editpage', this.onEditPageClick.createDelegate(this));
        $(view).bind('deletepage', this.onRemovePageClick.createDelegate(this));
    },

    onAddPageClick: function(){
        this.dialog.show();
    },

    onEditPageClick: function(e, view, model){
        this.editModel = model;
        this.dialog.show(model.attributes['name']);
    },

    onRemovePageClick: function(e, view, model){
        if (confirm('Do you really want to delete page "'+ model.attributes['name'] + '"?')){
            model.destroy();
        }
    },

    save: function (e, isEdit, text){
        var self = this;
        if (isEdit){
            this.editModel.set('name', text);
            this.editModel.save();
        } else {
            var model = this.collection.add({
                name: text
            }).last();
            model.save({}, {
                success: self.createView.createDelegate(this)
            });
        }
    },

    load: function(page){
        $('#pages ul li').removeClass('active')
        $('#page' + page).addClass('active');
    }
});

Mock.page.Dialog = Backbone.View.extend({
    isEdit: false,
    events: {
        'click .btn-primary': 'onSaveClick'
    },

    initialize: function(){
        this.$el = $('#modal-pages-dialog').modal({ show: false });
        this.el = this.$el.get()[0];
    },

    show: function(text){
        this.isEdit = text ? true : false;
        this.$el.find('input').attr('value', text || "");
        this.$el.find('.modal-header > h4').text(text ? 'Edit Page' : "Add Page");
        this.$el.modal('show');
    },

    hide: function(){
        this.$el.modal('hide');
    },

    onSaveClick: function(){
        this.hide();
        var text = this.$el.find('input').attr('value');
        $(this).trigger('save', [this.isEdit, text]);
    }
});


