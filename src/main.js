"use strict";

var glm = require('gl-matrix');
var Speck = require('./speck');
var Imposter = require('./imposter-renderer');
var fs = require('fs');
var xyz = require('./xyz');
var elements = require('./elements');
var View = require("./view");
var Atoms = require("./atoms");

var atoms = new Atoms();
var imposter = null;

function loadStructure(data) {

    atoms.clear();

    for (var i = 0; i < data.length; i++) {
        var a = data[i];
        var x = a.position[0];
        var y = a.position[1];
        var z = a.position[2];
    }

    
    for (var i = 0; i < data.length; i++) {
        var a = data[i];
        var x = a.position[0];
        var y = a.position[1];
        var z = a.position[2];
        atoms.addAtom(a.symbol, x,y,z);
    }

    atoms.center();

    imposter.setAtoms(atoms);

}


window.onload = function() {

    var canvas = document.getElementById("render-canvas");

    imposter = new Imposter(canvas, 768);

    var view = new View();

    var structs = {};
    structs.protein = fs.readFileSync(__dirname + "/samples/4E0O.xyz", 'utf8');
    structs.au = fs.readFileSync(__dirname + "/samples/au.xyz", 'utf8');
    structs.caffeine = fs.readFileSync(__dirname + "/samples/caffeine.xyz", 'utf8');
    structs.benzene = fs.readFileSync(__dirname + "/samples/benzene.xyz", 'utf8');
    structs.methane = fs.readFileSync(__dirname + "/samples/methane.xyz", 'utf8');

    loadStructure(xyz(structs.protein)[0]);

    var selector = document.getElementById("structure");
    selector.addEventListener("change", function() {
        loadStructure(xyz(structs[selector.value])[0]);
    });
    
    var lastX = 0.0;
    var lastY = 0.0;
    var buttonDown = false;

    canvas.addEventListener("mousedown", function(e) {
        document.body.style.cursor = "none";
        if (e.button == 0) {
            buttonDown = true;
        }
        lastX = e.clientX;
        lastY = e.clientY;
    });
    window.addEventListener("mouseup", function(e) {
        document.body.style.cursor = "";
        if (e.button == 0) {
            buttonDown = false;
        }
    });
    setInterval(function() {
        if (!buttonDown) {
            document.body.style.cursor = "";
        }
    }, 10);
    window.addEventListener("mousemove", function(e) {
        if (!buttonDown) {
            return;
        }
        var dx = e.clientX - lastX;
        var dy = e.clientY - lastY;
        if (dx == 0 && dy == 0) {
            return;
        }
        lastX = e.clientX;
        lastY = e.clientY;
        if (e.shiftKey) {
            view.translate(-dx*0.005, dy*0.005);
        } else {
            view.rotate(dx * 0.005, dy * 0.005);
        }
    });
    canvas.addEventListener("mousewheel", function(e) {
        if (e.wheelDelta > 0) {
            if (e.shiftKey) {
                view.scaleAtoms(1/0.9);
            } else {
                view.zoom(0.9);
            }
        } else {
            if (e.shiftKey) {
                view.scaleAtoms(0.9);
            } else {
                view.zoom(1/0.9);
            }
        }
        e.preventDefault();
    });


    function loop() {
        imposter.render(view);
        requestAnimationFrame(loop);
    }

    loop();

}