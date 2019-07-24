/**
 * @file Sidebar, includes code that will inject DOM into the sidebar (as well as other DOM manipulation code involving the sidebar)
 */
let Sidebar = (() => {
    //Private static variables
    let swappedVideos = false;

    /**
     * Sidebar, includes code that will inject DOM into the sidebar (as well as other DOM manipulation code involving the sidebar). It is presumed only 1 instance will be launched.
     */
    class Sidebar {
        /**
         * Initializes mainVideoIndex and initialize based on settings
         * @param {Object} settings settings object
         */
        constructor(settings) { 
            VideosLoadedEvent.subscribe(() => {
                this.mainVideoIndex = 0;
                this.init();
            });
        }

        /**
         * Init will initialize the sidebar. First grabs sidebar, prepends, then initializes tabs.
         * @returns {undefined}
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
                        if (!VideosLoadedEvent.isSingleVideoStream()) {
                            //Only trigger show / hide functionality because single video stream displays differently
                            if (!swappedVideos) {
                                if (ui.newTab[0].id === "sidebar-tab-1") {//show
                                    $("#leftPlayerContainer").show();
                                    $('aside[role="complementary"]').show();
                                    let ctxBridge = new ContextBridge(() => $(window).trigger('resize'));
                                    ctxBridge.exec();
                                } else if (ui.oldTab[0].id === "sidebar-tab-1") {//hide
                                    $("#leftPlayerContainer").hide();
                                    $('aside[role="complementary"]').hide();
                                }
                            } else {
                                if (ui.newTab[0].id === "sidebar-tab-1") {//show
                                    $(".secondaryPlayer.player.roaming").show();
                                    $("#rightPlayersContainer").css("visibility", "visible");
                                    $('aside[role="complementary"]').show();
                                    let ctxBridge = new ContextBridge(() => $(window).trigger('resize'));
                                    ctxBridge.exec();
                                } else if (ui.oldTab[0].id === "sidebar-tab-1") {//hide
                                    $(".secondaryPlayer.player.roaming").hide();
                                    $("#rightPlayersContainer").css("visibility", "hidden");
                                    $('aside[role="complementary"]').hide();
                                }
                            }

                            //Manage tab on change, because now it's used for 2nd screen also
                            if(ui.oldTab[0].id === "sidebar-tab-1" 
                                && ui.newTab[0].id !== "sidebar-tab-2" 
                                && $('#sidebar-tabs.secondScreenTranscriptShown').length > 0) {
                                $('#sidebar-tabs').removeClass('secondScreenTranscriptShown');
                                $('#sidebar-tab-pg-2').hide(100);
                            }
                            if (ui.newTab[0].id === "sidebar-tab-2") {
                                $("#sidebar-tab-pg-2").addClass("tab-shown");
                                $("#sidebar-tab-pg-2").removeAttr("style");
                                $("#megalist-transcript").removeAttr("style");
                            } else if (ui.oldTab[0].id === "sidebar-tab-2") {
                                $("#sidebar-tab-pg-2").removeClass("tab-shown");
                                let $sidebar = $('#sidebar-tab-pg-2').not(".tab-shown");
                                if ($sidebar.length > 0) {
                                    let top = $("#leftPlayerContainer").height() + $(".tabs-container").height();
                                    let height = $(window).height() - $(".tabs-container").offset().top - top - 44;
                                    $sidebar.css({ top: top });
                                    $("#megalist-transcript").css({ height: height });
                                }
                            }
                        } else {
                            //Single stream, no swapping of videos
                            if (ui.newTab[0].id === "sidebar-tab-1") {//show
                                $('aside[role="complementary"]').show();
                                let ctxBridge = new ContextBridge(() => $(window).trigger('resize'));
                                ctxBridge.exec();
                            } else if (ui.oldTab[0].id === "sidebar-tab-1") {//hide
                                $('aside[role="complementary"]').hide();
                            }
                        }
                    } 
                });

                //Add icons
                //$("#commentsTabHeader").prepend('<i class="far fa-comments"></i>');
                //$("#notesTabHeader").prepend('<i class="far fa-sticky-note"></i>');
                //$("#bookmarksTabHeader").prepend('<i class="far fa-bookmark"></i>');
                $("#hideEventsButton div").text("Hide Sidebar");
                //$("#hideEventsButton div").prepend('<i class="fas fa-chevron-left" style="padding-right:4px"></i>');
                $("#hideEventsButton").css({display: "initial", visibility: "visible"});

                //Hide button
                $("#sidebar-tabs .tabs-container .hide-btn").click(() => {
                    $("#hideEventsButton").children()[0].click();
                });
                $("#hideEventsButton div").click(() => {
                    $("#sidebar-tabs").addClass("collapsed");
                    $("#sidebar-tabs .tabs-container .hide-btn").hide();
                    $("#sidebar-tabs .tabs-container .show-btn").css('display','block');
                    sleep(400).then(() => TranscriptDisplay.resizeTranscriptIf2ndScreen());
                });

                //Show button
                $("#sidebar-tabs .tabs-container .show-btn").click(() => {
                    //Shifted to injected function
                    //$("#commentsTabHeader").click();
                    sleep(400).then(() => TranscriptDisplay.resizeTranscriptIf2ndScreen());
                });

                //Inject code to trigger our own expand mechanism on top of the default
                let injectedFunc = () => {
                    Panopto.Viewer.Viewer.expandLeftPaneFx = Panopto.Viewer.Viewer.expandLeftPane;
                    Panopto.Viewer.Viewer.expandLeftPane = () => {
                        //expand function
                        $("#sidebar-tabs").removeClass("collapsed");
                        $("#sidebar-tabs .tabs-container .show-btn").hide();
                        $("#sidebar-tabs .tabs-container .hide-btn").show();
                        //original implementation
                        Panopto.Viewer.Viewer.expandLeftPaneFx();
                    };

                    $("#sidebar-tabs .tabs-container .show-btn").click(() => {
                        Panopto.Viewer.Viewer.expandLeftPane();
                    });
                };
                let ctxBridge = new ContextBridge(injectedFunc);
                ctxBridge.exec();

                //Panopto literally switches the positions of the screens, so if the user toggles screens make sure it's on the right tab
                //Making it such that it stays on the same tab is a KIV
                $(document).on('mouseup', '.player-layout-controls i', function(event) {
                    //$("#sidebar-tabs").tabs("option", "active", 0);
                    $("#sidebar-tabs").tabs("option", "active", 0);
                    swappedVideos = !swappedVideos;
                    //self.mainVideoIndex ^= 1;//bit toggling
                });
                //Because we added the tabs, the max-height of the results part of the search feature needs to be modified on our side
                $("div.event-tab-scroll-pane").css("max-height",'-=40');

                //Initialize as collapsed if it is so
                if (VideosLoadedEvent.isSingleVideoStream()) {
                    $("#sidebar-tabs .tabs-container .hide-btn").click();
                }

                //Preact Components
                preact.render(preact.h(SettingsPage, null), document.getElementById("sidebar-tab-pg-3"));

                //Settings
                this.openTab(Settings.getDataAsObject()[Settings.keys.opentab]);
                sleep(1000).then(() => {
                    Settings.getDataAsObject()[Settings.keys.sidebar] ? this.expand() : this.collapse();
                });
            });
        }

        collapse() {
            $("#sidebar-tabs .tabs-container .hide-btn").click();
        }

        expand() {
            $("#sidebar-tabs .tabs-container .show-btn").click();
        }

        openTab(index) {
            $("#sidebar-tabs").tabs("option", "active", index);
        }
    }
    return Sidebar;
})();