/**
 * @file Sidebar, includes code that will inject DOM into the sidebar (as well as other DOM manipulation code involving the sidebar)
 */
let Sidebar = (() => {
    //Private static variables
    const videoContainers = ["#leftPlayerContainer","#rightPlayersContainer"];

    /**
     * Sidebar, includes code that will inject DOM into the sidebar (as well as other DOM manipulation code involving the sidebar). It is presumed only 1 instance will be launched.
     */
    class Sidebar {
        /**
         * Initializes mainVideoIndex
         */
        constructor() { this.mainVideoIndex = 0; }

        /**
         * Init will initialize the sidebar. First grabs sidebar, prepends, then initializes tabs.
         */
        init() {
            const self = this;
            //Get template
            Template.get('sidebar.html').then((template) => {
                //Append template to left pane DOM
                //# = id
                $("#leftPane").prepend(template);
                //http://api.jqueryui.com/tabs/#event-activate
                $("#sidebar-tabs").tabs({
                    //When the second screen is clicked, show the second screen and the extra stuff below it
                    activate: function( event, ui ) {
                        if (ui.newTab[0].id === "sidebar-tab-1") {
                            $(videoContainers[self.mainVideoIndex]).show();
                            $('aside[role="complementary"]').show();
                        } else if (ui.oldTab[0].id === "sidebar-tab-1") {
                            $(videoContainers[self.mainVideoIndex]).hide();
                            $('aside[role="complementary"]').hide();
                        }
                    }
                });

                //Panopto literally switches the positions of the screens, so if the user toggles screens make sure it's on the right tab
                //Making it such that it stays on the same tab is a KIV
                $(document).on('mouseup', '.player-layout-controls i', function(event) {
                    $("#sidebar-tabs").tabs("option", "active", 0);
                    self.mainVideoIndex ^= 1;//bit toggling
                });
                //Because we added the tabs, the max-height of the results part of the search feature needs to be modified on our side
                $("div.event-tab-scroll-pane").css("max-height",'-=40');
            });
        }
    }
    return Sidebar;
})();