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