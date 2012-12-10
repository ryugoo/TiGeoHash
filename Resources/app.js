/*jslint devel: true */
/*global Titanium, require */

(function (Ti) {
    "use strict";

    // Variables
    var tiGeoHash = require("/lib/TiGeoHash"),
        style = require("/style/app.style"),
        win = Ti.UI.createWindow(style.win),
        btn = Ti.UI.createButton(style.btn),
        lat = Ti.UI.createLabel(style.extend(style.label, {
            text: "Latitude"
        })),
        lng = Ti.UI.createLabel(style.extend(style.label, {
            text: "Longitude"
        })),
        geo = Ti.UI.createLabel(style.extend(style.label, {
            text: "GeoHash"
        })),
        nei = Ti.UI.createLabel(style.extend(style.label, {
            text: "Neighbors"
        })),
        map = Ti.Map.createView(style.map),
        pre = 7;

    // Event Listener
    function hdlBtn() {
        tiGeoHash.getCurrentGeoHash(function (result) {
            var i, l, dec, current, pin, ano = [];
            if (result.success) {
                lat.text = result.latitude;
                lng.text = result.longitude;
                geo.text = result.geohash;
                nei.text = (result.neighbors).join(", ");
                map.setLocation({
                    latitude: result.latitude,
                    longitude: result.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                });
                for (i = 0, l = result.neighbors.length; i < l; i += 1) {
                    dec = tiGeoHash.decodeGeoHash(result.neighbors[i]);
                    pin = Ti.Map.createAnnotation({
                        latitude: dec.latitude,
                        longitude: dec.longitude,
                        title: result.neighbors[i],
                        pincolor: Ti.Map.ANNOTATION_PURPLE
                    });
                    ano.push(pin);
                }
                map.addAnnotations(ano);
            } else {
                alert(result);
            }
        }, pre);
    }
    btn.addEventListener("click", hdlBtn);

    // Append and Start
    win.add(btn);
    win.add(lat);
    win.add(lng);
    win.add(geo);
    win.add(nei);
    win.add(map);
    win.open();
}(Titanium));