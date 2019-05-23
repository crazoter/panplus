(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("Bit", function moduleClosure(global, WebModule, VERIFY /*, VERBOSE */) {
"use strict";

// --- technical terms / data structure --------------------
// --- dependency modules ----------------------------------
// --- import / local extract functions --------------------
// --- define / local variables ----------------------------
var BIG_ENDIAN    = !new Uint8Array(new Uint16Array([1]).buffer)[0];
var SHARED_BUFFER = new ArrayBuffer(8);
var BYTE_VIEW     = new Uint8Array(SHARED_BUFFER);
var FLOAT32_VIEW  = new Float32Array(SHARED_BUFFER); // Single-precision
var FLOAT64_VIEW  = new Float64Array(SHARED_BUFFER); // Double-precision
var BYTE_ORDER32  = BIG_ENDIAN ? [0, 1, 2, 3] : [3, 2, 1, 0];
var BYTE_ORDER64  = BIG_ENDIAN ? [0, 1, 2, 3, 4, 5, 6, 7]
                               : [7, 6, 5, 4, 3, 2, 1, 0];
var BIT_SHIFT     = _createShiftValues();

// --- class / interfaces ----------------------------------
var Bit = {
    "VERIFY":       VERIFY,
    "n":            Bit_n,          // Bit.n(value:UINT32, bitPattern:UINT32):UINT32
    "cnl":          Bit_cnl,        // Bit.cnl(bitPattern:UINT32):UINT8
    "cnr":          Bit_cnr,        // Bit.cnr(bitPattern:UINT32):UINT8
    "split8":       Bit_split8,     // Bit.split8(u32:UINT32, bitPattern:UINT8Array|Uint8Array):UINT32Array
    "split16":      Bit_split16,    // Bit.split16(u32:UINT32, bitPattern:UINT8Array|Uint8Array):UINT32Array
    "split24":      Bit_split24,    // Bit.split24(u32:UINT32, bitPattern:UINT8Array|Uint8Array):UINT32Array
    "split32":      Bit_split32,    // Bit.split32(u32:UINT32, bitPattern:UINT8Array|Uint8Array):UINT32Array
    "reverse8":     Bit_reverse8,   // Bit.reverse8(u32:UINT8):UINT8
    "reverse16":    Bit_reverse16,  // Bit.reverse16(u32:UINT16):UINT16
    "reverse32":    Bit_reverse32,  // Bit.reverse32(u32:UINT32):UINT32
    "popcnt":       Bit_popcnt,     // Bit.popcnt(u32:UINT32):UINT8
    "nlz":          Bit_nlz,        // Bit.nlz(u32:UINT32):UINT8
    "ntz":          Bit_ntz,        // Bit.ntz(u32:UINT32):UINT8
    "clz":          Bit_nlz,        // [alias]
    "ctz":          Bit_ntz,        // [alias]
    "dump":         Bit_dump,       // Bit.dump(u32:UINT32, bitPattern:UINT8Array|Uint8Array, verbose:Boolean = false):String
    "IEEE754":      Bit_IEEE754,    // Bit.IEEE754(num:Number, doublePrecision:Boolean = false):UINT32Array
    "repository":   "https://github.com/uupaa/Bit.js",
};
// --- implements ------------------------------------------
function Bit_n(value,        // @arg UINT32
               bitPattern) { // @arg UINT32
                             // @ret UINT32
                             // @desc get contiguous n bits.
//{@dev
    if (Bit["VERIFY"]) {
        $valid($type(value,      "UINT32"), Bit_n, "value");
        $valid($type(bitPattern, "UINT32"), Bit_n, "bitPattern");
        $valid(bitPattern in BIT_SHIFT,     Bit_n, "bitPattern");
    }
//}@dev

    var shift = BIT_SHIFT[bitPattern];
    var mask  = bitPattern >>> shift;

    return (value >>> shift) & mask;
}

function Bit_cnl(bitPattern) { // @arg UINT32 - 0b0000111111110011 (contig = 8)
                               // @ret UINT8 - 8
                               // @desc Count the Number of contiguous 1 bits from Left-side.
//{@dev
    if (Bit["VERIFY"]) {
        $valid($type(bitPattern, "UINT32"), Bit_cnl, "bitPattern");
    }
//}@dev

    // short-cut
    if (bitPattern === 0) { return 0; }
    if (bitPattern === 1) { return 1; }
    if (bitPattern === 0xFFFFFFFF) { return 32; }

    var contig = 0;
    var start = 0;
    var end = 0;

    for (var i = 33, n = 0x80000000; i > 1; --i, n >>>= 1) {
        if (bitPattern & n) {
            if (end) { break; }
            if (!start) { start = i; }
            contig += 1;
        } else if (start && !end) {
            end = i;
        }
    }
    return contig;
}

function Bit_cnr(bitPattern) { // @arg UINT32 - 0b1100111111110000 (contig = 8)
                               // @ret UINT8 - 8
                               // @desc Count the Number of contiguous 1 bits from Right-side.
//{@dev
    if (Bit["VERIFY"]) {
        $valid($type(bitPattern, "UINT32"), Bit_cnr, "bitPattern");
    }
//}@dev

    // short-cut
    if (bitPattern === 0) { return 0; }
    if (bitPattern === 1) { return 1; }
    if (bitPattern === 0xFFFFFFFF) { return 32; }

    var contig = 0;
    var start = 0;
    var end = 0;

    for (var i = 1, n = 1; i < 33; ++i, n <<= 1) {
        if (bitPattern & n) {
            if (end) { break; }
            if (!start) { start = i; }
            contig += 1;
        } else if (start && !end) {
            end = i;
        }
    }
    return contig;
}

function Bit_split8(u32,          // @arg UINT32 - bits
                    bitPattern) { // @arg UINT8Array|Uint8Array - [width, ...]
                                  // @ret UINT32Array - [UINT32, ...]
    return _split(8, u32 & 0x000000ff, bitPattern);
}

function Bit_split16(u32,          // @arg UINT32 - bits
                     bitPattern) { // @arg UINT8Array|Uint8Array = null - [width, ...]
                                   // @ret UINT32Array - [UINT32, ...]
    return _split(16, u32 & 0x0000ffff, bitPattern);
}

function Bit_split24(u32,          // @arg UINT32 - bits
                     bitPattern) { // @arg UINT8Array|Uint8Array = null - [width, ...]
                                   // @ret UINT32Array - [UINT32, ...]
    return _split(24, u32 & 0x00ffffff, bitPattern);
}

function Bit_split32(u32,          // @arg UINT32 - bits
                     bitPattern) { // @arg UINT8Array|Uint8Array = null - [width, ...]
                                   // @ret UINT32Array - [UINT32, ...]
    return _split(32, (u32 & 0xffffffff) >>> 0, bitPattern);
}

function _split(bits,         // @arg UINT8 - 8/16/24/32
                u32,          // @arg UINT32 - masked value
                bitPattern,   // @arg UINT8Array|Uint8Array
                bitLength) {  // @arg Array|null
                              // @ret UINT32Array - [UINT32, ...]
//{@dev
    if (Bit["VERIFY"]) {
        $valid($type(u32,        "UINT32"),                _split, "u32");
        $valid($type(bitPattern, "UINT8Array|Uint8Array"), _split, "bitPattern");
    }
//}@dev

    var remainBits = bits;
    var iz = bitPattern.length;

    // ES6 based Uint32Array has Array#functions(eg: join, map, reduce), it is very convinient.
    // but ES5 based Uint32Array has not it.
    // So that the user is easy to use, this function will return the array.
 // var result = new Uint32Array(iz + 1);
    var result = new Array(iz);

    for (var i = 0; i < iz; ++i) {
        var w = bitPattern[i];
        var v = 0;

        if (remainBits > 0) {
            if (w > 0) {
                if (w > remainBits) {
                    w = remainBits;
                }
                var vv = u32 >>> (remainBits - w);
                var ww = w >= bits ? 0xffffffff : (1 << w) - 1;

                v = (vv & ww) >>> 0;
                remainBits -= w;
            }
        }
        result[i] = v;

        if (bitLength) {
            bitLength[i] = w;
        }
    }
    return result;
}

function Bit_dump(u32,        // @arg UINT32
                  bitPattern, // @arg UINT8Array|Uint8Array
                  verbose) {  // @arg Boolean = false - verbose mode. add source value, radix 10 and radix 16
                              // @ret String - "11000,101,..." or "11000(24,0x1f),101(5,0x5),..."
//{@dev
    if (Bit["VERIFY"]) {
        $valid($type(u32,        "UINT32"),                Bit_dump, "u32");
        $valid($type(bitPattern, "UINT8Array|Uint8Array"), Bit_dump, "bitPattern");
        $valid($type(verbose,    "Boolean|omit"),          Bit_dump, "verbose");
    }
//}@dev

    verbose = verbose || false;

    var result = [];
    var bitLength = [];
    var filler = "00000000000000000000000000000000";
    var r = _split(32, u32, bitPattern, bitLength);

    if (verbose) {
        r.unshift(u32);
        bitLength.unshift(32);
    }

    for (var i = 0, iz = r.length; i < iz; ++i) {
        var w = bitLength[i] ? bitLength[i] : 1;
        var v = filler + r[i].toString(2);

        if (verbose) {
            if (i === 0) {
                result.push( v.slice(-w) + ("(0x" + (0x100000000 + r[i]).toString(16).slice(-8) + ")") );
            } else {
                result.push( v.slice(-w) + ("("  + r[i].toString()   + ",")
                                         + ("0x" + r[i].toString(16) + ")") );
            }
        } else {
            result.push( v.slice(-w) );
        }
    }
    return result.join(", ");
}

function Bit_reverse8(u8) { // @arg UINT8 - value
                            // @ret UINT8 - reversed value
                            // @desc reverse the bit order. 0b00001110 -> 0b01110000
//{@dev
    if (Bit["VERIFY"]) {
        $valid($type(u8, "UINT8"), Bit_reverse8, "u8");
    }
//}@dev

    u8 = ((u8 & 0x55) << 1) | ((u8 & 0xAA) >>> 1);
    u8 = ((u8 & 0x33) << 2) | ((u8 & 0xCC) >>> 2);

    return (((u8 & 0x0F) << 4) | (u8 >>> 4)) >>> 0;
}

function Bit_reverse16(u16) { // @arg UINT16 - value
                              // @ret UINT16 - reversed value
                              // @desc reverse the bit order. 0b0000000011100000 -> 0b0000011100000000
//{@dev
    if (Bit["VERIFY"]) {
        $valid($type(u16, "UINT16"), Bit_reverse16, "u16");
    }
//}@dev

    // [1]
    //
    // `ABCD EFGH IJKL MNOP` `ABCD EFGH IJKL MNOP`
    //           &                     &
    // `0101 0101 0101 0101` `1010 1010 1010 1010`
    //          ||                    ||
    //  -B-D -F-H -J-L -N-P   A-C- E-G- I-K- M-O-
    //         << 1                  >> 1
    //  B-D- F-H- J-L- N-P-   -A-C -E-G -I-K -M-O
    //                    \  /
    //                     ||
    //            B-D- F-H- J-L- N-P-
    //            -A-C -E-G -I-K -M-O
    //                     ||
    //           `BADC FEHG JILK NMPO`
    //
    // [2]
    //
    // `BADC FEHG JILK NMPO` `BADC FEHG JILK NMPO`
    //           &                     &
    // `0011 0011 0011 0011` `1100 1100 1100 1100`
    //          ||                    ||
    //  --DC --HG --LK --PO   BA-- FE-- JI-- NM--
    //         << 2                  >> 2
    //  DC-- HG-- LK-- PO--   --BA --FE --JI --NM
    //                    \  /
    //                     ||
    //              DC-- HG-- LK-- PO--
    //              --BA --FE --JI --NM
    //                     ||
    //             `DCBA HGFE LKJI PONM`
    //
    // [3]
    //
    // `DCBA HGFE LKJI PONM` `DCBA HGFE LKJI PONM`
    //           &                     &
    // `0000 1111 0000 1111` `1111 0000 1111 0000`
    //          ||                    ||
    //  ---- HGFE ---- PONM   DCBA ---- LKJI ----
    //         << 4                  >> 4
    //  HGFE ---- PONM ----   ---- DCBA ---- LKJI
    //                    \  /
    //                     ||
    //              HGFE ---- PONM ----
    //              ---- DCBA ---- LKJI
    //                     ||
    //             `HGFE DCBA PONM LKJI`
    //
    // [4]
    //
    // `HGFE DCBA PONM LKJI` `HGFE DCBA PONM LKJI`
    //         << 8                  >> 8
    //  PONM LKJI ---- ----   ---- ---- HGFE DCBA
    //                    \  /
    //                     ||
    //              PONM LKJI ---- ----
    //              ---- ---- HGFE DCBA
    //              PONM LKJI HGFE DCBA

    u16 = ((u16 & 0x5555) << 1) | ((u16 & 0xAAAA) >>> 1); // [1]
    u16 = ((u16 & 0x3333) << 2) | ((u16 & 0xCCCC) >>> 2); // [2]
    u16 = ((u16 & 0x0F0F) << 4) | ((u16 & 0xF0F0) >>> 4); // [3]

    return (((u16 & 0x00FF) << 8) | (u16 >>> 8)) >>> 0;
}

function Bit_reverse32(u32) { // @arg UINT32 - value
                              // @ret UINT32 - reversed value
                              // @desc reverse the bit order.
//{@dev
    if (Bit["VERIFY"]) {
        $valid($type(u32, "UINT32"), Bit_reverse32, "u32");
    }
//}@dev

    u32 = ((u32 & 0x55555555) << 1) | ((u32 & 0xAAAAAAAA) >>> 1);
    u32 = ((u32 & 0x33333333) << 2) | ((u32 & 0xCCCCCCCC) >>> 2);
    u32 = ((u32 & 0x0F0F0F0F) << 4) | ((u32 & 0xF0F0F0F0) >>> 4);
    u32 = ((u32 & 0x00FF00FF) << 8) | ((u32 & 0xFF00FF00) >>> 8);

    return (((u32 & 0x0000FFFF) << 16) | (u32 >>> 16)) >>> 0;
}

function Bit_popcnt(u32) { // @arg UINT32 - value
                           // @ret UINT8 - 0-32
                           // @desc population count (counting 1 bits), SSE4.2 POPCNT function
                           // @see http://www.nminoru.jp/~nminoru/programming/bitcount.html
//{@dev
    if (Bit["VERIFY"]) {
        $valid($type(u32, "UINT32"), Bit_popcnt, "u32");
    }
//}@dev

    return _popCount(u32);
}

function _popCount(u32) {
    u32 =  (u32 & 0x55555555) + (u32 >>  1 & 0x55555555);
    u32 =  (u32 & 0x33333333) + (u32 >>  2 & 0x33333333);
    u32 =  (u32 & 0x0f0f0f0f) + (u32 >>  4 & 0x0f0f0f0f);
    u32 =  (u32 & 0x00ff00ff) + (u32 >>  8 & 0x00ff00ff);
    return (u32 & 0x0000ffff) + (u32 >> 16 & 0x0000ffff);
}

function Bit_nlz(u32) { // @arg UINT32 - value
                        // @ret UINT8 - 0-31
                        // @desc Number of Leading Zero
//{@dev
    if (Bit["VERIFY"]) {
        $valid($type(u32, "UINT32"), Bit_nlz, "u32");
    }
//}@dev

    //  >>x         nlz = 2
    //  00101000
    //      x<<<    ntz = 3
    //
    var f64 = Bit_IEEE754(u32 === 0 ? 0.5 : u32, true); // Double-precision
    var exp = (f64[0] >>> 20) & 0x007ff; // 11 bits
    var bias = 1023;

    return (bias + 31) - exp;
}

function Bit_ntz(u32) { // @arg UINT32 - value
                        // @ret UINT8 - 0-31
                        // @desc Number of Training Zero
//{@dev
    if (Bit["VERIFY"]) {
        $valid($type(u32, "UINT32"), Bit_ntz, "u32");
    }
//}@dev

    //  >>x         nlz = 2
    //  00101000
    //      x<<<    ntz = 3

    return _popCount( ((~u32) & (u32 - 1)) >>> 0 );
}

function Bit_IEEE754(num,               // @arg Number
                     doublePrecision) { // @arg Boolean = false - Double-precision
                                        // @ret Uint32Array - [high, low]
//{@dev
    if (Bit["VERIFY"]) {
        $valid($type(num,             "Number"),       Bit_IEEE754, "num");
        $valid($type(doublePrecision, "Boolean|omit"), Bit_IEEE754, "doublePrecision");
    }
//}@dev

    var order = null, high = 0, low  = 0;

    if (doublePrecision) {
        // to IEEE754 Double-precision floating-point format.
        //
        // sign exponent  fraction
        //  +-++--------++-----------------------+
        //  |0||0......0||0.....................0|
        //  +-++--------++-----------------------+
        //   1     11               52 bits
        //   -  --------  -----------------------
        //   63 62    52  51                    0
        //
        order = BYTE_ORDER64;
        FLOAT64_VIEW[0] = num;
        high = BYTE_VIEW[order[0]] << 24 | BYTE_VIEW[order[1]] << 16 |
               BYTE_VIEW[order[2]] <<  8 | BYTE_VIEW[order[3]];
        low  = BYTE_VIEW[order[4]] << 24 | BYTE_VIEW[order[5]] << 16 |
               BYTE_VIEW[order[6]] <<  8 | BYTE_VIEW[order[7]];
    } else {
        // to IEEE754 Single-precision floating-point format.
        //
        // sign exponent  fraction
        //  +-++--------++-----------------------+
        //  |0||00000000||00000000000000000000000|
        //  +-++--------++-----------------------+
        //   1      8               23 bits
        //   -  --------  -----------------------
        //   31 30    23  22                    0
        //
        order = BYTE_ORDER32;
        FLOAT32_VIEW[0] = num;
        high = BYTE_VIEW[order[0]] << 24 | BYTE_VIEW[order[1]] << 16 |
               BYTE_VIEW[order[2]] <<  8 | BYTE_VIEW[order[3]];
    }
    return new Uint32Array([high >>> 0, low >>> 0]);
}

function _createShiftValues() { // @ret Object - { 0x01: 0, ..., 0x100: 8, ..., 0xff00: 8, 0xffffffff: 0 }
    var i = 0, n = 0;
    var shift = {};

    for (i = 0, n = 0xff;       i <  8; n >>>= 1, ++i) { _add(n, i + 1); }
    for (i = 0, n = 0xffff;     i < 16; n >>>= 1, ++i) { _add(n, i + 1); }
    for (i = 0, n = 0xffffffff; i < 32; n >>>= 1, ++i) { _add(n, i + 1); }

    function _add(n, jz) {
        for (var j = 0; j < jz; n <<= 1, ++j) {
            shift[n >>> 0] = j;
        }
    }
    return shift;
}

return Bit; // return entity

});

