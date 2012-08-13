Mock.namespace('Mock.menu');

Mock.menu.Menu = Mock.extend(null, {
    rootDomSelector: '.navbar .nav',
    menu: [],

    initialize: function(o){
        $.extend(this, o);
        this.root = $(this.rootDomSelector);
        this.render();
    },

    render: function(){
        var tpl = Handlebars.compile($('#menu-template').html()),
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

    fireEvent: function(e, el){
        var attr = $(el).attr('data-menu');
        if (attr) $(this).trigger(attr, $(el));
    }
});