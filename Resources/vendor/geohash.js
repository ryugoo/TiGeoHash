/*jslint bitwise: true */
/*global window, exports */

/**
 * JavaScript GeoHash Library
 * ---------
 * Original: python-geohash (http://code.google.com/p/python-geohash/)
 *         : Copyright (C) 2009 Hiroaki Kawai <kawai@iij.ad.jp>
 * Base JS : js-geohash (https://github.com/y-matsuwitter/js-geohash)
 * ---------
 * License : MIT
 */
(function () {
    "use strict";
    // Variables
    var iterator, len, root = this,
        geohash = {},
        base32Map = {},
        base32 = "0123456789bcdefghjkmnpqrstuvwxyz";
    for (iterator = 0, len = base32.length; iterator < len; iterator += 1) {
        base32Map[base32[iterator]] = iterator;
    }
    // Functions for encode
    function encodeI2C(lat, lon, latLen, lonLen) {
        var a, b, c, boost = [0, 1, 4, 5, 16, 17, 20, 21],
            ret = "",
            base32Arr = base32.split(""),
            precision = (latLen + lonLen) / 5;
        if (latLen < lonLen) {
            a = lon;
            b = lat;
        } else {
            a = lat;
            b = lon;
        }
        for (iterator = 0; iterator < precision; iterator += 1) {
            ret += base32Arr[(boost[a & 7] + (boost[b & 3] << 1)) & 0x1F];
            c = parseInt(a * Math.pow(2, -3), 10);
            a = parseInt(b * Math.pow(2, -2), 10);
            b = c;
        }
        return ret.split("").reverse().join("");
    }
    function encode(lat, lon, precision) {
        if (lat >= 90 || lat < -90) {
            return "";
        }
        precision = precision || 12;
        var xprecision = precision + 1,
            latLen = parseInt((xprecision * 5 / 2), 10),
            lonLen = parseInt((xprecision * 5 / 2), 10);
        if (xprecision % 2 === 1) {
            lonLen += 1;
        }
        while (lon < -180.0) {
            lon += 360;
        }
        while (lon >= 180.0) {
            lon -= 360;
        }
        lat = lat / 180.0;
        lon = lon / 360.0;
        if (lat > 0) {
            lat = parseInt(Math.pow(2, latLen) * lat + Math.pow(2, latLen - 1), 10);
        } else {
            lat = Math.pow(2, latLen - 1) - parseInt(Math.pow(2, latLen) * (-1.0 * lat), 10);
        }
        if (lon > 0) {
            lon = parseInt(Math.pow(2, lonLen) * lon + Math.pow(2, lonLen - 1), 10);
        } else {
            lon = Math.pow(2, lonLen - 1) - parseInt(Math.pow(2, lonLen) * (-1.0 * lon), 10);
        }
        return encodeI2C(lat, lon, latLen, lonLen).substring(0, precision);
    }
    // Functions for decode
    function decodeC2I(hashcode) {
        var a, lon = 0,
            lat = 0,
            bitLen = 0,
            latLen = 0,
            lonLen = 0,
            hash = hashcode.split("");
        for (iterator = 0, len = hash.length; iterator < len; iterator += 1) {
            a = base32Map[hash[iterator]];
            if (bitLen % 2 === 0) {
                lon = lon * 8;
                lat = lat * 4;
                lon += (a / 4) & 4;
                lat += (a / 4) & 2;
                lon += (a / 2) & 2;
                lat += (a / 2) & 1;
                lon += a & 1;
                lonLen += 3;
                latLen += 2;
            } else {
                lon = lon * 4;
                lat = lat * 8;
                lat += (a / 4) & 4;
                lon += (a / 4) & 2;
                lat += (a / 2) & 2;
                lon += (a / 2) & 1;
                lat += a & 1;
                lonLen += 2;
                latLen += 3;
            }
            bitLen += 5;
        }
        return [lat, lon, latLen, lonLen];
    }
    function decode(hashcode, delta) {
        delta = delta || false;
        var calcedLat, calcedLon, deltaLat, deltaLon, decodeData = decodeC2I(hashcode),
            lat = decodeData[0],
            lon = decodeData[1],
            latLen = decodeData[2] + 1,
            lonLen = decodeData[3] + 1;
        lat = (lat * 2) + 1;
        lon = (lon * 2) + 1;
        calcedLat = 180.0 * (lat - Math.pow(2, (latLen - 1))) / Math.pow(2, latLen);
        calcedLon = 360.0 * (lon - Math.pow(2, (lonLen - 1))) / Math.pow(2, lonLen);
        if (delta) {
            deltaLat = 180.0 / Math.pow(2, latLen);
            deltaLon = 360.0 / Math.pow(2, lonLen);
            return [calcedLat, calcedLon, deltaLat, deltaLon];
        }
        return [calcedLat, calcedLon];
    }
    function decodeExactly(hashcode) {
        return decode(hashcode, true);
    }
    // Functions for others
    function bbox(hashcode) {
        var decodeData = decodeC2I(hashcode),
            lat = decodeData[0],
            lon = decodeData[1],
            latLen = decodeData[2],
            lonLen = decodeData[3],
            ret = {};
        if (latLen) {
            ret.north = 180.0 * (lat + 1 - Math.pow(2, (latLen - 1))) / Math.pow(2, latLen);
            ret.south = 180.0 * (lat - Math.pow(2, (latLen - 1))) / Math.pow(2, latLen);
        } else {
            ret.north = 90.0;
            ret.south = -90.0;
        }
        if (lonLen) {
            ret.east = 360.0 * (lon + 1 - Math.pow(2, (lonLen - 1))) / Math.pow(2, lonLen);
            ret.west = 360.0 * (lon - Math.pow(2, (lonLen - 1))) / Math.pow(2, lonLen);
        } else {
            ret.east = 180.0;
            ret.west = -180.0;
        }
        return ret;
    }
    function neighbors(hashcode) {
        var decodeData = decodeC2I(hashcode),
            lat = decodeData[0],
            lon = decodeData[1],
            latLen = decodeData[2],
            lonLen = decodeData[3],
            calcLat = lat,
            calcLon = lon,
            ret = [];

        ret.push(encodeI2C(calcLat, calcLon - 1, latLen, lonLen));
        ret.push(encodeI2C(calcLat, calcLon + 1, latLen, lonLen));

        calcLat = lat + 1;
        if (calcLat >= 0) {
            ret.push(encodeI2C(calcLat, calcLon - 1, latLen, lonLen));
            ret.push(encodeI2C(calcLat, calcLon, latLen, lonLen));
            ret.push(encodeI2C(calcLat, calcLon + 1, latLen, lonLen));
        }
        calcLat = lat - 1;
        if ((calcLat / Math.pow(2, latLen)) !== 0) {
            ret.push(encodeI2C(calcLat, calcLon - 1, latLen, lonLen));
            ret.push(encodeI2C(calcLat, calcLon, latLen, lonLen));
            ret.push(encodeI2C(calcLat, calcLon + 1, latLen, lonLen));
        }
        return ret;
    }
    function expand(hashcode) {
        var ret = neighbors(hashcode);
        ret.push(hashcode);
        return ret;
    }
    function contain(lat, lon, hashcode) {
        var decodeData = bbox(hashcode);
        if (lat < decodeData.north && lat > decodeData.south && lon > decodeData.west && lon < decodeData.east) {
            return true;
        }
        return false;
    }
    function containExpand(lat, lon, hashcode) {
        var decodeData = expand(hashcode);
        for (iterator = 0, len = decodeData.length; iterator < len; iterator += 1) {
            if (contain(lat, lon, decodeData[iterator])) {
                return true;
            }
        }
        return false;
    }
    // Public functions
    geohash = {
        encode: encode,
        decode: decode,
        decodeExactly: decodeExactly,
        bbox: bbox,
        expand: expand,
        neighbors: neighbors,
        contain: contain,
        containExpand: containExpand
    };
    if (typeof exports !== "undefined") {
        exports.geohash = geohash;
    } else {
        if (window && typeof window === "object") {
            window.geohash = geohash;
        }
    }
}());