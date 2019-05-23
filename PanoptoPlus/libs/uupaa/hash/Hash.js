(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("Hash", function moduleClosure(global, WebModule, VERIFY /*, VERBOSE */) {
"use strict";

// --- technical terms / data structure --------------------
// --- dependency modules ----------------------------------
var Bit = WebModule["Bit"];
// --- import / local extract functions --------------------
// --- define / local variables ----------------------------
var CRC_MODEL = {
    1:  { name: "CRC16_CCITT", polynomial: 0x00001021, width: 16, xorIn: 0x1d0f,     xorOut: 0x0000,     reflectIn: false, shiftLeft: true  },
    2:  { name: "CRC16_IBM",   polynomial: 0x00008005, width: 16, xorIn: 0x0000,     xorOut: 0x0000,     reflectIn: true,  shiftLeft: false },
    10: { name: "CRC32",       polynomial: 0x04C11DB7, width: 32, xorIn: 0xFFFFFFFF, xorOut: 0xFFFFFFFF, reflectIn: true,  shiftLeft: false },
    11: { name: "CRC32_MPEG2", polynomial: 0x04C11DB7, width: 32, xorIn: 0xFFFFFFFF, xorOut: 0x00000000, reflectIn: false, shiftLeft: true  },
};

// --- class / interfaces ----------------------------------
var Hash = {
    "MD5":          null,       // Hash.MD5(source:Uint8Array|String, hex:Boolean = false):Uint8Array|HexString
    "SHA1":         null,       // Hash.SHA1(source:Uint8Array|String, hex:Boolean = false):Uint8Array|HexString
    "HMAC":         null,       // Hash.HMAC(method:String, key:Uint8Array|String, message:Uint8Array|String, hex:Boolean = false):Uint8Array|HexString
    "Adler32":      Adler32,    // Hash.Adler32(source:Uint8Array|String, Hex:Boolean = false, seed:Integer = 1):UINT32|HexString
    "XXHash":       XXHash,     // Hash.XXHash(source:Uint8Array|String, hex:Boolean = false, seed:Integer = 0):UINT32|HexString
    "Murmur":       Murmur,     // Hash.Murmur(source:Uint8Array|String, hex:Boolean = false, seed:Integer = 0):UINT32|HexString
    "CRC":          CRC,        // Hash.CRC(source:Uint8Array|String, model:CRCModelNumber, options:Object = {}):UINT32|HexString
    "toHexString":  toHexString,// Hash.toHexString(source:UINT32|Uint8Array|Uint16Array|Uint32Array):HexString
    "repository":   "https://github.com/uupaa/Hash.js", // GitHub repository URL. http://git.io/Help
    // --- CRC Model enum ---
    "CRC16_CCITT":  1,
    "CRC16_IBM":    2,
    "CRC32":        10,
    "CRC32_MPEG2":  11,
};

// --- implements ------------------------------------------
// === MD5 =================================================
//{@md5
Hash["MD5"] = MD5;

// pre-calculated table
var MD5_A = [
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf,
        0x4787c62a, 0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af,
        0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e,
        0x49b40821, 0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
        0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8, 0x21e1cde6,
        0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
        0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122,
        0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
        0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039,
        0xe6db99e5, 0x1fa27cf8, 0xc4ac5665, 0xf4292244, 0x432aff97,
        0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d,
        0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
        0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391 ];
var MD5_S = [
        7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
        5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
        4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
        6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21 ];
var MD5_X = [
        0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
        1,  6, 11,  0,  5, 10, 15,  4,  9, 14,  3,  8, 13,  2,  7, 12,
        5,  8, 11, 14,  1,  4,  7, 10, 13,  0,  3,  6,  9, 12, 15,  2,
        0,  7, 14,  5, 12,  3, 10,  1,  8, 15,  6, 13,  4, 11,  2,  9 ];

function MD5(source, // @arg Uint8Array|String
             hex) {  // @arg Boolean = false
                     // @ret Uint8Array|HexString
//{@dev
    if (VERIFY) {
        $valid($type(source, "Uint8Array|String"), MD5, "source");
        $valid($type(hex,    "Boolean|omit"),      MD5, "hex");
    }
//}@dev

    var source_ = typeof source === "string" ? _toUint8Array(source) : source;
    var buffer = _createBufferWith64BytePadding(source_);
    var e = source_.length * 8;

    buffer[buffer.length - 8] = e        & 0xff;
    buffer[buffer.length - 7] = e >>>  8 & 0xff;
    buffer[buffer.length - 6] = e >>> 16 & 0xff;
    buffer[buffer.length - 5] = e >>> 24 & 0xff;

    var hash   = _MD5(buffer); // [a, b, c, d]
    var result = new Uint8Array(16);

    for (var ri = 0, hi = 0; hi < 4; ri += 4, ++hi) {
        result[ri    ] = hash[hi]        & 0xff;
        result[ri + 1] = hash[hi] >>>  8 & 0xff;
        result[ri + 2] = hash[hi] >>> 16 & 0xff;
        result[ri + 3] = hash[hi] >>> 24 & 0xff;
    }
    return hex ? toHexString(result) : result;
}

function _MD5(source) { // @arg Uint8Array
                        // @ret Array - MD5 hash. [a, b, c, d]
    // setup default values
    var a = 0x67452301;
    var b = 0xefcdab89;
    var c = 0x98badcfe;
    var d = 0x10325476;

    // working and temporary
    var i = 0, iz = source.length, j = 0, k = 0, n = 0;
    var word = [];

    for (; i < iz; i += 64) {
        for (j = 0; j < 16; ++j) {
            k = i + j * 4;
            word[j] = source[k] + (source[k + 1] <<  8) +
                                  (source[k + 2] << 16) +
                                  (source[k + 3] << 24);
        }
        var aa = a;
        var bb = b;
        var cc = c;
        var dd = d;

        for (j = 0; j < 64; ++j) {
            n = j < 16 ? (b & c) | (~b & d) // ff - Round 1
              : j < 32 ? (b & d) | (c & ~d) // gg - Round 2
              : j < 48 ?  b ^ c ^ d         // hh - Round 3
                       :  c ^ (b | ~d);     // ii - Round 4
            n += a + word[MD5_X[j]] + MD5_A[j];

            var ra = b + ((n << MD5_S[j]) | (n >>> (32 - MD5_S[j])));
            var rb = b;
            var rc = c;
            // --- rotate ---
            a = d;
            b = ra;
            c = rb;
            d = rc;
        }
        a += aa;
        b += bb;
        c += cc;
        d += dd;
    }
    return [a, b, c, d];
}
//}@md5

// === SHA1 ================================================
//{@sha1
Hash["SHA1"] = SHA1;

function SHA1(source, // @arg Uint8Array|String
              hex) {  // @arg Boolean = false
                      // @ret Uint8Array|HexString
//{@dev
    if (VERIFY) {
        $valid($type(source, "Uint8Array|String"), SHA1, "source");
        $valid($type(hex,    "Boolean|omit"),      SHA1, "hex");
    }
//}@dev

    var source_ = typeof source === "string" ? _toUint8Array(source) : source;
    var buffer = _createBufferWith64BytePadding(source_);
    var e = source_.length * 8;

    buffer[buffer.length - 1] = e        & 0xff;
    buffer[buffer.length - 2] = e >>>  8 & 0xff;
    buffer[buffer.length - 3] = e >>> 16 & 0xff;
    buffer[buffer.length - 4] = e >>> 24 & 0xff;

    var hash   = _SHA1(buffer); // [a, b, c, d, e]
    var result = new Uint8Array(20);

    for (var ri = 0, hi = 0; hi < 5; ri += 4, ++hi) {
        result[ri    ] = hash[hi] >>> 24 & 0xff;
        result[ri + 1] = hash[hi] >>> 16 & 0xff;
        result[ri + 2] = hash[hi] >>>  8 & 0xff;
        result[ri + 3] = hash[hi]        & 0xff;
    }
    return hex ? toHexString(result) : result;
}

function _SHA1(source) { // @arg Uint8Array
                         // @ret Array - SHA1. [a, b, c, d, e]
    // setup default values
    var a = 0x67452301;
    var b = 0xefcdab89;
    var c = 0x98badcfe;
    var d = 0x10325476;
    var e = 0xc3d2e1f0;

    // working and temporary
    var i = 0, iz = source.length, j = 0, jz = 0, n = 0;
    var word = [];

    for (; i < iz; i += 64) {
        var aa = a;
        var bb = b;
        var cc = c;
        var dd = d;
        var ee = e;

        for (j = i, jz = i + 64, n = 0; j < jz; j += 4, ++n) {
            word[n] = (source[j]     << 24) | (source[j + 1] << 16) |
                      (source[j + 2] <<  8) |  source[j + 3];
        }
        for (j = 16; j < 80; ++j) {
            n = word[j - 3] ^ word[j - 8] ^ word[j - 14] ^ word[j - 16];
            word[j] = (n << 1) | (n >>> 31);
        }
        for (j = 0; j < 80; ++j) {
            n = j < 20 ? ((b & c) ^ (~b & d))           + 0x5a827999
              : j < 40 ?  (b ^ c ^ d)                   + 0x6ed9eba1
              : j < 60 ? ((b & c) ^  (b & d) ^ (c & d)) + 0x8f1bbcdc
                       :  (b ^ c ^ d)                   + 0xca62c1d6;
            n += ((a << 5) | (a >>> 27)) + word[j] + e;

            e = d;
            d = c;
            c = (b << 30) | (b >>> 2);
            b = a;
            a = n;
        }
        a += aa;
        b += bb;
        c += cc;
        d += dd;
        e += ee;
    }
    return [a, b, c, d, e];
}
//}@sha1

// === HMAC ================================================
//{@hmac
Hash["HMAC"] = HMAC;

function HMAC(method,  // @arg String - hash method. "SHA1", "MD5"
              key,     // @arg Uint8Array|String
              message, // @arg Uint8Array|String
              hex) {   // @arg Boolean = false
                       // @ret Uint8Array|HexString
                       // @desc encode HMAC-SHA1, HMAC-MD5
//{@dev
    if (VERIFY) {
        $valid($type(method,  "String"),            HMAC, "method");
        $valid(/SHA1|MD5/.test(method),             HMAC, "method");
        $valid($type(key,     "Uint8Array|String"), HMAC, "key");
        $valid($type(message, "Uint8Array|String"), HMAC, "message");
        $valid($type(hex,     "Boolean|omit"),      HMAC, "hex");
    }
//}@dev

    var key_     = typeof key     === "string" ? _toUint8Array(key)     : key;
    var message_ = typeof message === "string" ? _toUint8Array(message) : message;

    // see http://en.wikipedia.org/wiki/HMAC
    var blockSize = 64; // magic word(MD5.blockSize = 64, SHA1.blockSize = 64)

    if (key_.length > blockSize) {
        key_ = Hash[method](key_);
    }

    var padSize = Math.max(key_.length, blockSize);
    var opad = new Uint8Array(padSize);
    var ipad = new Uint8Array(padSize);

    opad.set(key_);
    ipad.set(key_);

    for (var i = 0; i < blockSize; ++i) {
        opad[i] ^= 0x5C; // xor
        ipad[i] ^= 0x36; // xor
    }
    var hash   = Hash[method]( _addUint8Array(ipad, message_) );
    var result = Hash[method]( _addUint8Array(opad, hash) );

    return hex ? toHexString(result) : result;
}
//}@hmac

// === Adler32 =============================================
function Adler32(source, // @arg Uint8Array|String
                 hex,    // @arg Boolean = false
                 seed) { // @arg Integer = 1 - seed
                         // @ret UINT32|HexString - 0x00000000 or "00000000"
                         // @desc http://en.wikipedia.org/wiki/Adler-32
//{@dev
    if (VERIFY) {
        $valid($type(source, "Uint8Array|String"), Adler32, "source");
        $valid($type(hex,    "Boolean|omit"),      Adler32, "hex");
        $valid($type(seed,   "Integer|omit"),      Adler32, "seed");
    }
//}@dev

    seed = seed === undefined ? 1 : seed;

    var source_ = typeof source === "string" ? _toUint8Array(source) : source;

    // optimization
    // https://gist.github.com/uupaa/bb81ccf31e25868ce8f7
    var u32 = new Uint32Array([
                        seed         & 0xffff,  // a
                       (seed >>> 16) & 0xffff,  // b
                        source_.length,         // len
                        0,                      // i
                        0,                      // tlen
                        65521,                  // MOD_ADLER
                        5550,                   // MAGIC_NUMBER
                        0                       // pad (reserved)
                    ]);

    var a            = u32[0];
    var b            = u32[1];
    var len          = u32[2];
    var i            = u32[3];
    var tlen         = u32[4];
    var MOD_ADLER    = u32[5];
    var MAGIC_NUMBER = u32[6];

    while (len > 0) {
        tlen = len > MAGIC_NUMBER ? MAGIC_NUMBER : len;
        len -= tlen;

        do {
            a += source_[i++];
            b += a;
        } while (--tlen);

        a %= MOD_ADLER;
        b %= MOD_ADLER;
    }

    var result = ((b << 16) | a) >>> 0; // to uint32

    return hex ? toHexString(result) : result;
}

// === XXHash ==============================================
function XXHash(source, // @arg Uint8Array|String
                hex,    // @arg Boolean = false
                seed) { // @arg Integer = 0 - seed
                        // @ret UINT32|HexString
                        // @desc XXHash 32 bit hash string.
//{@dev
    if (VERIFY) {
        $valid($type(source, "Uint8Array|String"), XXHash, "source");
        $valid($type(hex,    "Boolean|omit"),      XXHash, "hex");
        $valid($type(seed,   "Integer|omit"),      XXHash, "seed");
    }
//}@dev

    var source_ = typeof source === "string" ? _toUint8Array(source) : source;
    var u32     = _createXXHash(source_, source_.length, seed || 0);

    return hex ? toHexString(u32) : u32;
}

function _createXXHash(input,  // @arg Uint8Array
                       len,    // @arg Integer - input length
                       seed) { // @arg UINT32
                               // @ret UINT32 - xxHash result
                               // @desc XXHash 32 bit hash.
    // https://gist.github.com/uupaa/8609d8d2d4ee6876eac1
    var Math_imul = Math["imul"] || es6_polyfill_math_imul;
    var PRIME32_1 = 2654435761;
    var PRIME32_2 = 2246822519;
    var PRIME32_3 = 3266489917;
    var PRIME32_4 =  668265263;
    var PRIME32_5 =  374761393;

    var p = 0;
    var bEnd = p + len;
    var v = new Uint32Array(5); // v[0] aka h32

    // bulk loop (unit: 16bytes)
    if (len >= 16) {
        var limit = bEnd - 16;

        v[1] = seed + PRIME32_1 + PRIME32_2; // aka v1
        v[2] = seed + PRIME32_2;             // aka v2
        v[3] = seed + 0;                     // aka v3
        v[4] = seed - PRIME32_1;             // aka v4

        do {
            v[1] += Math_imul(XXH_get32bits(input, p), PRIME32_2);
            v[1]  = XXH_rotl32(v[1], 13);
            v[1]  = Math_imul(v[1], PRIME32_1);
            p += 4;

            v[2] += Math_imul(XXH_get32bits(input, p), PRIME32_2);
            v[2]  = XXH_rotl32(v[2], 13);
            v[2]  = Math_imul(v[2], PRIME32_1);
            p += 4;

            v[3] += Math_imul(XXH_get32bits(input, p), PRIME32_2);
            v[3]  = XXH_rotl32(v[3], 13);
            v[3]  = Math_imul(v[3], PRIME32_1);
            p += 4;

            v[4] += Math_imul(XXH_get32bits(input, p), PRIME32_2);
            v[4]  = XXH_rotl32(v[4], 13);
            v[4]  = Math_imul(v[4], PRIME32_1);
            p += 4;
        }
        while (p <= limit);

        v[0] = XXH_rotl32(v[1], 1)  + XXH_rotl32(v[2], 7) +
               XXH_rotl32(v[3], 12) + XXH_rotl32(v[4], 18);
    } else {
        v[0] = seed + PRIME32_5;
    }

    v[0] += len;

    // bulk loop (unit: 4bytes)
    while (p + 4 <= bEnd) {
        v[0] += Math_imul(XXH_get32bits(input, p), PRIME32_3);
        v[0]  = Math_imul(XXH_rotl32(v[0], 17), PRIME32_4);
        p += 4;
    }

    // remain loop (unit: 1byte)
    while (p < bEnd) {
        v[0] += Math_imul(input[p], PRIME32_5);
        v[0]  = Math_imul(XXH_rotl32(v[0], 11), PRIME32_1);
        p++;
    }

    v[0] ^= v[0] >>> 15;
    v[0]  = Math_imul(v[0], PRIME32_2);
    v[0] ^= v[0] >>> 13;
    v[0]  = Math_imul(v[0], PRIME32_3);
    v[0] ^= v[0] >>> 16;

    return v[0];
}

function XXH_get32bits(source, // @arg Uint8Array
                       p) {    // @arg Integer - pointer(source index)
    return (source[p + 3] << 24) | (source[p + 2] << 16) |
           (source[p + 1] <<  8) |  source[p];
}

function XXH_rotl32(x,   // @arg Uint32  - value
                    r) { // @arg Uint8   - bit shift value (0 - 31)
                         // @ret Integer
    return (x << r) | (x >>> (32 - r));
}

// === Murmur ==============================================
function Murmur(source, // @arg Uint8Array|String
                hex,    // @arg Boolean = false
                seed) { // @arg Integer = 0 - seed
                        // @ret UINT32|HexString
                        // @desc create Murmur 32bit hash.
//{@dev
    if (VERIFY) {
        $valid($type(source, "Uint8Array|String"), Murmur, "source");
        $valid($type(hex,    "Boolean|omit"),      Murmur, "hex");
        $valid($type(seed,   "Integer|omit"),      Murmur, "seed");
    }
//}@dev

    var source_ = typeof source === "string" ? _toUint8Array(source) : source;
    var u32     = _createMurmur32(source_, seed || 0);

    return hex ? toHexString(u32) : u32;
}

function _createMurmur32(source, // @arg Uint8Array
                         seed) { // @arg Integer
                                 // @ret UINT32
    // http://en.wikipedia.org/wiki/MurmurHash
    // https://gist.github.com/uupaa/8609d8d2d4ee6876eac1
    var Math_imul = Math["imul"] || es6_polyfill_math_imul;
    var u32 = new Uint32Array([seed, 0, 0]); // [hash, k, k1]
    var remain = source.length;
    var cursor = 0; // source cursor

    while (remain >= 4) {
        u32[1] = source[cursor]            | (source[cursor + 1] <<  8) |
                (source[cursor + 2] << 16) | (source[cursor + 3] << 24);

        u32[1] = Math_imul(u32[1], 0xcc9e2d51);                 // k *= c1;
        u32[1] = (u32[1] << 15) | (u32[1] >>> (32 - 15));       // k = (k << r1) | (k >> (32 - r1));
        u32[1] = Math_imul(u32[1], 0x1b873593);                 // k *= c2;

        u32[0] ^= u32[1];                                       // hash ^= k;
        u32[0] = (u32[0] << 13) | (u32[0] >>> (32 - 13));       // hash = ((hash << r2) | (hash >> (32 - r2)));
        u32[0] = Math_imul(u32[0], 5) + 0xe6546b64;             // hash = hash * m + n;

        cursor += 4;
        remain -= 4;
    }

    switch (remain) {
    case 3: u32[2] ^= source[cursor + 2] << 16;                 // k1 ^= source[i + 2] << 16;
    /* falls through */
    case 2: u32[2] ^= source[cursor + 1] << 8;                  // k1 ^= source[i + 1] << 8;
    /* falls through */
    case 1: u32[2] ^= source[cursor];                           // k1 ^= source[i];

            u32[2] = Math_imul(u32[2], 0xcc9e2d51);             // k1 *= c1;
            u32[2] = (u32[2] << 15) | (u32[2] >>> (32 - 15));   // k1 = (k1 << r1) | (k1 >> (32 - r1));
            u32[2] = Math_imul(u32[2], 0x1b873593);             // k1 *= c2;
            u32[0] ^= u32[2];                                   // hash ^= k1;
    }

    u32[0] ^= source.length;                                    // hash ^= len;
    u32[0] ^= (u32[0] >>> 16);                                  // hash ^= (hash >> 16);
    u32[0]  = Math_imul(u32[0], 0x85ebca6b);                    // hash *= 0x85ebca6b;
    u32[0] ^= (u32[0] >>> 13);                                  // hash ^= (hash >> 13);
    u32[0]  = Math_imul(u32[0], 0xc2b2ae35);                    // hash *= 0xc2b2ae35;
    u32[0] ^= (u32[0] >>> 16);                                  // hash ^= (hash >> 16);

    return u32[0];
}

// === CRC ===============================================
var CRC_TABLE = {};

function CRC(source,    // @arg Uint8Array|String
             model,     // @arg CRCModelNumber - Hash.CRC16xx, Hash.CRC32xx
             options) { // @arg Object = {} - { hex, offset, length }
                        // @options.hex    Boolean = false - toHexString
                        // @options.offset UINT32 = 0
                        // @options.length UINT32 = source.length
                        // @ret UINT32|HexString
//{@dev
    if (VERIFY) {
        $valid($type(source,  "Uint8Array|String"), CRC, "source");
        $valid($type(model,   "CRCModelNumber"),    CRC, "model");
        $valid($type(options, "Object|omit"),       CRC, "options");
        if (options) {
            $valid($keys(options,        "hex|offset|length"), CRC, "options");
            $valid($type(options.hex,    "Boolean|omit"),      CRC, "options.hex");
            $valid($type(options.offset, "UINT32|omit"),       CRC, "options.offset");
            $valid($type(options.length, "UINT32|omit"),       CRC, "options.length");
        }
    }
//}@dev

    options = options || {};

    var param    = CRC_MODEL[model];

    if ( !CRC_TABLE[model] ) {
        CRC_TABLE[model] = _createCRCTable(param.width, param.polynomial, param.reflectIn);
    }
    var hex      = options["hex"]    || false;
    var offset   = options["offset"] || 0;
    var length   = options["length"] || 0;
    var src      = typeof source === "string" ? _toUint8Array(source) : source;
    var c        = param.width === 16 ? new Uint16Array([0]) : new Uint32Array([0]);
    var i        = offset || 0;
    var iz       = i + (length || (src.length - i));
    var table    = CRC_TABLE[model];
    var bitShift = param.width === 16 ? 8 : 24;

    if (param.xorIn) {
        c[0] ^= param.xorIn;
    }
    if (param.shiftLeft) {
        for (; i < iz; ++i) {
            c[0] = (c[0] <<  8) ^ table[((c[0] >>> bitShift) ^ src[i]) & 0xFF];
        }
    } else {
        for (; i < iz; ++i) {
            c[0] = (c[0] >>> 8) ^ table[(c[0]                ^ src[i]) & 0xFF];
        }
    }
    if (param.xorOut) {
        c[0] ^= param.xorOut;
    }
    return hex ? toHexString(c[0]) : c[0]; // HexString or UINT32
}

function _createCRCTable(width,        // @arg UINT8 - 16 or 32
                         polynomial,   // @arg UINT32
                         reflect) {    // @arg Boolean
                                       // @ret Uint16Array|Uint32Array
    var w16      = width === 16;
    var c        = w16 ? new Uint16Array(1)   : new Uint32Array(1);
    var result   = w16 ? new Uint16Array(256) : new Uint32Array(256);
    var MSB      = w16 ? 0x8000 : 0x80000000;
    var bitShift = w16 ? 8 : 24;
    var i = 0;
    var j = 0;

    if (reflect) {
        polynomial = Bit[w16 ? "reverse16" : "reverse32"](polynomial);
    }

    if (reflect) {
        for (i = 0; i < 256; ++i) {
            c[0] = i;
            for (j = 0; j < 8; ++j) {
                if (c[0] & 1) {
                    c[0] = (c[0] >>> 1) ^ polynomial;
                } else {
                    c[0] = (c[0] >>> 1);
                }
            }
            result[i] = c[0];
        }
    } else {
        for (i = 0; i < 256; ++i) {
            c[0] = i << bitShift;
            for (j = 0; j < 8; ++j) {
                c[0] = (c[0] << 1) ^ ((c[0] & MSB) ? polynomial : 0);
            }
            result[i] = c[0];
        }
    }
    return result;
}

// === Utility ===========================================
function _toUint8Array(source) { // @arg BinaryString
                                 // @ret Uint8Array
    var result = new Uint8Array(source.length);

    for (var i = 0, iz = source.length; i < iz; ++i) {
        result[i] = source.charCodeAt(i) & 0xff;
    }
    return result;
}

function toHexString(source) { // @arg UINT32|Uint8Array|Uint16Array|Uint32Array
                               // @ret HexString - "004153434949ff"
//{@dev
    if (VERIFY) {
        $valid($type(source, "UINT32|Uint8Array|Uint16Array|Uint32Array"), toHexString, "source");
    }
//}@dev

    var HEX = "0123456789abcdef";
    var result = [];
    var i = 0, iz = 0;

    if (typeof source === "number") {
        source = new Uint32Array([source]);
    }
    if (source instanceof Uint8Array) {
        for (iz = source.length; i < iz; ++i) {
            var u8 = source[i];
            result.push( HEX[(u8  >>  4) & 0xf], HEX[(u8       ) & 0xf] );
        }
    } else if (source instanceof Uint16Array) {
        for (iz = source.length; i < iz; ++i) {
            var u16 = source[i];
            result.push( HEX[(u16 >> 12) & 0xf], HEX[(u16 >>  8) & 0xf],
                         HEX[(u16 >>  4) & 0xf], HEX[(u16      ) & 0xf] );
        }
    } else if (source instanceof Uint32Array) {
        for (iz = source.length; i < iz; ++i) {
            var u32 = source[i];
            result.push( HEX[(u32 >>> 28) & 0xf], HEX[(u32 >>> 24) & 0xf],
                         HEX[(u32 >>> 20) & 0xf], HEX[(u32 >>> 16) & 0xf],
                         HEX[(u32 >>> 12) & 0xf], HEX[(u32 >>>  8) & 0xf],
                         HEX[(u32 >>>  4) & 0xf], HEX[(u32       ) & 0xf] );
        }
    }
    return result.join("");
}

function _addUint8Array(source, add) {
    var result = new Uint8Array(source.length + add.length);

    result.set(source, 0);
    result.set(add, source.length);
    return result;
}

function _createBufferWith64BytePadding(source) {
    var iz     = source.length;
    var remain = (iz + 1) % 64;
    var times  = (iz + 1) >> 6;

    if (remain > 56) {
        ++times;
    }
    var buffer = new Uint8Array( (times + 1) << 6 );

    buffer.set(source);
    buffer[iz] = 0x80;
    return buffer;
}

function es6_polyfill_math_imul(a,   // @arg Uint32|Uint64 - value a
                                b) { // @arg Uint32|Uint64 - value b
                                     // @ret Uint32 - the C-like 32-bit multiplication of the two parameters.
    var a_high = (a >>> 16) & 0xffff;
    var a_low  =  a         & 0xffff;
    var b_high = (b >>> 16) & 0xffff;
    var b_low  =  b         & 0xffff;

    return ((a_low * b_low) + (((a_high * b_low + a_low * b_high) << 16) >>> 0) | 0);
}

return Hash; // return entity

});

