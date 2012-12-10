/*jslint devel: true */
/*global Titanium, module */

(function (Ti) {
    "use strict";

    var style = {
        win: {
            backgroundColor: "#FFFFFF",
            layout: "vertical"
        },
        btn: {
            top: 44,
            title: "Get GeoHash!"
        },
        label: {
            top: 22,
            color: "#666666",
            font: {
                fontFamily: "monospace"
            }
        },
        map: {
            top: 22,
            mapType: Ti.Map.STANDARD_TYPE,
            animate: true,
            regionFit: true
        },
        extend: function (target, append) {
            var key;
            for (key in append) {
                if (append.hasOwnProperty(key)) {
                    target[key] = append[key];
                }
            }
            return target;
        }
    };

    module.exports = style;
}(Titanium));