/**
 * @file Transcript class to hold the transcript
 */
let Transcript = (() => {
    class Transcript {
        /**
         * 
         * @param {Object} data [{time: Number, text: String},...]
         */
        constructor(data) {
            if (!data) throw new Error("Transcript data cannot be undefined");
            this.data = data;
        }

        /**
         * Generate VTTCue based on data
         * https://iandevlin.com/blog/2015/02/javascript/dynamically-adding-text-tracks-to-html5-video/
         * @param {Number} index index to access
         * @param {Number} flashDelay time to hide previous subtitle and show next. Default is 0.2s.
         * @param {Number} lastIndexDuration time to show last subtitle. Default is 10s.
         */
        getVttCue(index, flashDelay = 0.2, lastIndexDuration = 10) {
            if (index >= 0 && index < this.data.length) {
                if (index !== this.data.length - 1) {
                    return new VTTCue(this.data[index].time, this.data[index+1].time - flashDelay, this.data[index].text);
                } else {
                    //Since data has no end time and this is the last index, we'll just use a magic duration
                    return new VTTCue(this.data[index].time, this.data[index].time + lastIndexDuration, this.data[index].text);
                }
            } else {
                throw new Error("Transcript out of bounds: Tried to access index " + index);
            }
        }

        /**
         * Convert to VTTCueArray for subtitling
         * @param {Number} flashDelay time to hide previous subtitle and show next. Default is 0.2s.
         * @param {Number} lastIndexDuration time to show last subtitle. Default is 10s.
         */
        toVTTCueArray(flashDelay, lastIndexDuration) {
            var result = [];
            for (var i = 0; i < this.data.length; i++)
                result.push(this.getVttCue(i, flashDelay, lastIndexDuration));
            return result;
        }
    }
    return Transcript;
})();