var expect = require("chai").expect;
var should = require('should');
var assert = require('assert');

var Interpreter = require('../src/interpreter');


describe("Interpreter", function () {

    var interpreter = null;

    before(function () {
        // runs before all tests in this block

    });

    after(function () {
        // runs after all tests in this block
    });

    beforeEach(function () {
        // runs before each test in this block
        interpreter = new Interpreter();
    });

    afterEach(function () {
        // runs after each test in this block
    });


    describe('Parsing DB', function() {
        it('processValidFact should fill the factMap with the processed fact', function() {
            var element = 'padre(roberto, cecilia).';
            var parsedElement = element.replace(/(\t|\n|\.)/g, '');
            var factMap = getFactMap();
            factMap.clear();
            assert(factMap.size === 0);
            processValidFact(parsedElement);
            assert(factMap.size === 1);
            assert(factMap.get('padrerobertocecilia') === 1);
        });
        it('processValidRule should fill the factMap with the processed rule', function() {
            var element = 'hija(X, Y) :- mujer(X), padre(Y, X).';
            var parsedElement = element.replace(/(\t|\n|\.)/g, '');
            var ruleMap = getRuleMap();
            ruleMap.clear();
            assert(ruleMap.size === 0);
            processValidRule(parsedElement);
            assert(ruleMap.size === 1);
            assert(ruleMap.get('hija')[0] === 2);
            assert(ruleMap.get('hija')[1] === 'X');
            assert(ruleMap.get('hija')[2] === 'Y');
            assert(ruleMap.get('hija')[3] === 'mujerX');
            assert(ruleMap.get('hija')[4] === 'padreYX');
        });
        it('parsinDB correct parsing', function() {
            var db = [
                "varon(juan).",
                "varon(pepe).",
                "padre(juan, pepe).",
                "hijo(X, Y) :- varon(X), padre(Y, X)."
            ];
            var factMap = getFactMap();
            var ruleMap = getRuleMap();
            factMap.clear();
            ruleMap.clear();
            assert(ruleMap.size === 0);
            assert(factMap.size === 0);
            var result = interpreter.parseDB(db);
            assert(result['error'] === false);
            assert(factMap.get('varonjuan') === 1);
            assert(ruleMap.has('hijo'));
        });
        it('parsinDB failing because of bad entry', function() {
            var db = [
                "varon(juan).",
                "varon(pepe).",
                "padrejuan, pepe).",
                "hijo(X, Y) :- varon(X), padre(Y, X)."
            ];
            var factMap = getFactMap();
            var ruleMap = getRuleMap();
            factMap.clear();
            ruleMap.clear();
            assert(ruleMap.size === 0);
            assert(factMap.size === 0);
            var result = interpreter.parseDB(db);
            assert(result['error'] === true);
            assert(result['element'] === 'padrejuan, pepe)');
            assert(result['line'] === 3);
        });
    });

});