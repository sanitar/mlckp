Mock.namespace('Mock.menu');

Mock.menu.Menu = Mock.extend(null, {
    rootDomSelector: '.navbar .nav',
    imageRootPath: 'menu',
    dividerClass: 'divider',
    menu: [],

    initialize: function(o){
        $.extend(this, o);
        this.dividerHtml = _.template($("#menu-divider-template").html())({
            divider: this.dividerClass
        });
        this.root = $(this.rootDomSelector);
        this.render();
    },

    render: function(){
        var template = _.template($("#menu-item-template").html()),
            rootDom = this.root,
            menu = this.menu,
            rootPath = this.imageRootPath,
            self = this;

        this.menu = {};
        this.appendDivider();

        $.each(menu, function(index, item){
            if (Mock.isArray(item)){
                for (var i = 0; i < item.length; i++){
                    var menu_item = item[i],
                        el = $(template({
                            menu_item: menu_item,
                            tooltip: menu_item.split('_').slice(1).join(' ')
                        })),
                        path = 'url(/assets/' + rootPath + '/' + menu_item + '.png)';

                    rootDom.append(el);
                    el.find('span').css({
                        backgroundImage: path
                    });
                    el.on('click', self.fireEvent.createDelegate(self, [menu_item]));
                    self.menu[menu_item] = el;
                }
                self.appendDivider();
            }
        });
    },

    fireEvent: function(menu_item){
        $(this).trigger(menu_item, [this.menu[menu_item]]);
    },

    appendDivider: function(){
        this.root.append($(this.dividerHtml));
    }
});
Mock.namespace('Mock.dialogs');
Mock.dialogs.PageDialog = Backbone.View.extend({
    id: '#modal-pages-dialog',
    events: {

    },
    initialize: function(){
        this.el = $(this.id).get()[0];
        this.$el = $(this.el);
    },
    render: function(){
        console.log('render');

    }
});

Mock.namespace('Mock.pages');

Mock.pages.PageCollection = Backbone.Collection.extend({
  //url: ''
});

Mock.menu.Pages = Backbone.Router.extend({
    rootSelector: '#pages ul',
    templateId: '#page-item-template',
    routes: {
        ':page': 'load'
    },

    initialize: function(o){
        $.extend(this, o);
        this.root = $(this.rootSelector);
        this.template = _.template($(this.templateId).html());
        this.dialogEl = $('#modal-pages-dialog');
        this.dialog = this.dialogEl.modal({ show: false });
        this.dialogEl.find('.btn.btn-primary').on('click', this.save.createDelegate(this));
        this.render();
    },

    render: function(){
        var self = this,
            addList = [];

        this.collection.each(function(item, index){
            addList.push($(self.template(item.toJSON())).get()[0]);
        });

        this.root.append(addList);
        this.list = $(addList);
        $(addList).hover(function(e, el){
            $(this).find('span').toggle();
        });
        $(addList).find('.icon-pencil').click(this.onEditPage.createDelegate(this));
        $(addList).find('.icon-trash').click(this.onDeletePage.createDelegate(this));
        $('#pages .icon-plus').click(this.onAddPage.createDelegate(this));
    },

    load: function(page){
        this.list.removeClass('active');
        $('#page' + page).addClass('active');
    },

    onAddPage: function(e){
        this.showDialog();
    },

    onEditPage: function(e, el){
        var my = $(el).parents('a').text().trim();
        this.showDialog(my);
        return false;
    },

    onDeletePage: function(e){
        console.log('delete page!');
        return false;
    },

    save: function(e, el){
        var input = this.dialogEl.find('input');
        if (input.attr('value') == ''){
            this.dialogEl.find('.control-group').addClass('error');
            return;
        }
        if (this.dialogEl.find('.modal-header > h4').text() == "Add Page"){
            console.log('add page');
        } else {
            console.log('edit page');
        }
    },

    showDialog: function(text){
        this.dialog.find('input').attr('value', text || "");
        this.dialog.find('.modal-header > h4').text(text ? 'Edit Page' : "Add Page");
        this.dialog.modal('show');
    }
});


