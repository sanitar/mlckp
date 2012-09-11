Mock.modules = Mock.modules || {};

Mock.modules.CreateBlockFromElement = function(){

    var workspace = $('#workspace'),
        workspacePosition = workspace.offset(),
        elementsInNavigation = $('#groups .tab-pane > div');

    var isCursorInWorkspaceRegion = function(x, y){
        return (x > workspacePosition.left && y > workspacePosition.top &&
            x < (workspace.width() + workspacePosition.left) && y < (workspace.height() + workspacePosition.top));
    };

    elementsInNavigation.on('dragstop', function(e){
        if (isCursorInWorkspaceRegion(e.pageX - 10, e.pageY - 10)){
            var elementId = parseInt(e.target.id, 10),
                elementAttributes = $.findInArray(Mock.data.elements, function(item){
                    return elementId == item.id;
                }),
                elementParams = $.parseJSON(elementAttributes.initial);

            elementParams.x = e.pageX - workspacePosition.left - 17; // элемент должен встать на место курсора
            elementParams.y = e.pageY - workspacePosition.top - 17;  // учитывая все его поля и рамки

            Mock.blocks.create({
                element_id: elementId,
                params: JSON.stringify(elementParams)
            });

            Mock.blocks.save();
        }
    });

};

Mock.modules.ContextMenu = function(){
    var workspace = $('#workspace'),
        contextMenu = $('.context_menu'),
        contextMenuItems = contextMenu.find('li:not(.divider)'),
        contextMenuItemPaste = contextMenuItems.filter('[data-menu="menu_paste"]');

    workspace.on('contextmenu', function(event){
        var hasSelection = workspace.find('.ui-selected').length !== 0,
            isBufferEmpty = Mock.buffer.get() == undefined;

        // показать контекстное меню
        contextMenu
            .addClass('open')
            .css({
                left: event.pageX,
                top: event.pageY
            });

        contextMenuItems.toggleClass('disabled', !hasSelection);
        contextMenuItemPaste.toggleClass('disabled', isBufferEmpty);

        // скрыть контекстное меню по клику в любое место
        // * событие 'click' блокируется jquery.ui.selectable
        $('body').one('mousedown', function(){
            contextMenu.removeClass('open');
        });
        return false;
    });

    // вызов события при выборе пункта меню
    contextMenuItems.filter(':not(.dropdown-submenu)').mousedown(function(e){
        var isDisabled = $(this).hasClass('disabled');

        if (!isDisabled){
            var contextMenuItemName = $(this).attr('data-menu');
            switch (contextMenuItemName){
                case 'menu_copy':
                    Mock.buffer.set(workspace.find('.ui-selected'));
                    break;
                case 'menu_paste':
                    console.log('menu paste');
                    break;
                case 'menu_duplicate':
                    Mock.blocks.duplicate(workspace.find('.ui-selected'));
                    break;
                case 'menu_remove':
                    Mock.blocks.remove(workspace.find('.ui-selected'));
                    Mock.blocks.save();
                    break;
            }
        }
    });
}