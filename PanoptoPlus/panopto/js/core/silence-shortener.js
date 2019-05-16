function SilenceShortener() {
    this.init = function() {
        VideosLoadedEvent.subscribe(() => { 
            var videoDOMs = document.querySelectorAll('video');
            var harkInstance = hark(videoDOMs[0], {threshold: Settings.getHarkThreshold()});
            harkInstance.setInterval(20);

            harkInstance.on('speaking', function() {
                for (var i = 0; i < videoDOMs.length; i++) 
                    videoDOMs[i].playbackRate = Settings.getNormalPlaybackRate();
                console.log('speaking');
            });

            harkInstance.on('stopped_speaking', function() {
                if(videoDOMs[0].readyState !== videoDOMs[0].HAVE_ENOUGH_DATA) {
                    console.log('stopped_speaking but not enough data');
                    return;
                }
                for (var i = 0; i < videoDOMs.length; i++) 
                    videoDOMs[i].playbackRate = Settings.getSilencePlaybackRate();
                console.log('stopped_speaking');
            });
        });
    };
}

