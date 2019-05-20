OfflineMP2AudioWASM = (function(){ "use strict";

// Copy of mp2-wasm.js by Dominic Szablewski with modifications that make it inappropriate to extend the class
// https://github.com/phoboslab/jsmpeg/tree/master/src

// Based on kjmp2 by Martin J. Fiedler
// http://keyj.emphy.de/kjmp2/

var MP2WASM = function(options) {
	OfflineBaseDecoder.call(this, options);

	this.onDecodeCallback = options.onAudioDecode;
	this.module = options.wasmModule;

	this.bufferSize = options.audioBufferSize || 128*1024;
	this.bufferMode = options.streaming
		? JSMpeg.BitBuffer.MODE.EVICT
		: JSMpeg.BitBuffer.MODE.EXPAND;

	this.sampleRate = 0;
};

MP2WASM.prototype = Object.create(OfflineBaseDecoder.prototype);
MP2WASM.prototype.constructor = MP2WASM;

MP2WASM.prototype.initializeWasmDecoder = function() {
	if (!this.module.instance) {
		console.warn('JSMpeg: WASM module not compiled yet');
		return;
	}
	this.instance = this.module.instance;
	this.functions = this.module.instance.exports;
	this.decoder = this.functions._mp2_decoder_create(this.bufferSize, this.bufferMode);
};

MP2WASM.prototype.destroy = function() {
	if (!this.decoder) {
		return;
	}
	this.functions._mp2_decoder_destroy(this.decoder);
};

MP2WASM.prototype.bufferGetIndex = function() {
	if (!this.decoder) {
		return;
	}
	return this.functions._mp2_decoder_get_index(this.decoder);
};

MP2WASM.prototype.bufferSetIndex = function(index) {
	if (!this.decoder) {
		return;
	}
	this.functions._mp2_decoder_set_index(this.decoder, index);
};

MP2WASM.prototype.bufferWrite = function(buffers) {
	if (!this.decoder) {
		this.initializeWasmDecoder();
	}

	var totalLength = 0;
	for (var i = 0; i < buffers.length; i++) {
		totalLength += buffers[i].length;
	}

	var ptr = this.functions._mp2_decoder_get_write_ptr(this.decoder, totalLength);
	for (var i = 0; i < buffers.length; i++) {
		this.instance.heapU8.set(buffers[i], ptr);
		ptr += buffers[i].length;
	}
	
	this.functions._mp2_decoder_did_write(this.decoder, totalLength);
	return totalLength;
};

MP2WASM.prototype.decode = function() {
    var pos = this.bits.index >> 3;
    if (pos >= this.bits.byteLength) {
        return false;
    }

    var decoded = this.decodeFrame(this.left, this.right);
    this.bits.index = (pos + decoded) << 3;
    if (!decoded) {
        return false;
    }

    if (this.destination) {
        this.destination.process(this.sampleRate, this.left, this.right, this.getCurrentTime());
    }

    this.advanceDecodedTime(this.left.length / this.sampleRate);

    //Modified callback with modified time
    if (this.onDecodeCallback) {
        this.onDecodeCallback(this, this.getCurrentTime());
    }
    return true;
};


MP2WASM.prototype.getCurrentTime = function() {
	var enqueuedTime = this.destination ? this.destination.enqueuedTime : 0;
	return this.decodedTime - enqueuedTime;
};

MP2WASM.SAMPLES_PER_FRAME = 1152;

return MP2WASM;

})();

