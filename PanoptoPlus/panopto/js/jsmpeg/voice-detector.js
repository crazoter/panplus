VoiceDetector = function() {
    this.onFinishedProcessing = null;
    this.results = [];

    VoiceDetector.prototype.onDecoderReady = function(decoder) {
        while (decoder.decode()) {};
        onFinishedProcessing(results);
    };

    VoiceDetector.prototype.process = function(sampleRate, left, right) {
        //Do FTT
        this.gain.gain.value = this.volume;
    
        var buffer = this.context.createBuffer(2, left.length, sampleRate);
        buffer.getChannelData(0).set(left);
        buffer.getChannelData(1).set(right);
    
        var source = this.context.createBufferSource();
        source.buffer = buffer;
        source.connect(this.destination);
    
        var now = this.context.currentTime;
        var duration = buffer.duration;
        if (this.startTime < now) {
            this.startTime = now;
            this.wallclockStartTime = JSMpeg.Now();
        }
    
        source.start(this.startTime);
        this.startTime += duration;
        this.wallclockStartTime += duration;
    };

    VoiceDetector.prototype.finishedProcessing = function() {
        var self = this;
        return new Promise(function(resolve) {
            self.onFinishedProcessing = resolve;
        });
    }
}