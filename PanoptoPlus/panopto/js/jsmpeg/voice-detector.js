VoiceDetector = function() {
    this.onFinishedProcessing = null;
    this.results = [];

    VoiceDetector.prototype.onDecoderReady = function(decoder) {
        debugger;
        while (decoder.decode()) {};
        if (this.onFinishedProcessing) this.onFinishedProcessing(this.results);
        else throw new Error("onFinishedProcessing callback not established");
    };

    VoiceDetector.prototype.process = function(sampleRate, left, right, timestamp) {
        //Do fast fourier transform fft
        //Sampling rate usually going to be around 44100
        //2048 is the fft size, our fft library needs the size to be a power of 2
        //Meaning of fft size: https://www.spectraplus.com/DT_help/fft_size.htm
        //We don't really need a high frequency resolution
        /*
        var fft = new FFT(2048);

        //Perform fft on both left and right (speakers)
        const leftOutput = fft.createComplexArray();
        fft.realTransform(leftOutput, left);
        const rightOutput = fft.createComplexArray();
        fft.realTransform(rightOutput, right);*/
    };

    VoiceDetector.prototype.finishedProcessing = function() {
        var self = this;
        return new Promise(function(resolve) {
            self.onFinishedProcessing = resolve;
        });
    }
}