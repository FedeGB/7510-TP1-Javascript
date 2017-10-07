var expect = require("chai").expect;
var should = require('should');
var assert = require('assert');

var Interpreter = require('../src/interpreter');


describe("Interpreter", function () {

    var db = [
        "varon(juan).",
        "varon(pepe).",
        "varon(hector).",
        "varon(roberto).",
        "varon(alejandro).",
        "mujer(maria).",
        "mujer(cecilia).",
        "padre(juan, pepe).",
        "padre(juan, pepa).",
        "padre(hector, maria).",
        "padre(roberto, alejandro).",
        "padre(roberto, cecilia).",
        "hijo(X, Y) :- varon(X), padre(Y, X).",
        "hija(X, Y) :- mujer(X), padre(Y, X)."
    ];

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
        var factMap = new Map();
        var ruleMap = new Map();
        interpreter.parseDB(db);
    });

    afterEach(function () {
        // runs after each test in this block
    });


    describe('Interpreter Facts', function () {

        it('varon(juan) should be true', function () {
            assert(interpreter.checkQuery('varon(juan)'));
        });

        it('varon(maria) should be false', function () {
            assert(interpreter.checkQuery('varon(maria)') === false);
        });

        it('mujer(cecilia) should be true', function () {
            assert(interpreter.checkQuery('mujer(cecilia)'));
        });

        it('padre(juan, pepe) should be true', function () {
            assert(interpreter.checkQuery('padre(juan, pepe)') === true);
        });

        it('padre(mario, pepe) should be false', function () {
            assert(interpreter.checkQuery('padre(mario, pepe)') === false);
        });

        // TODO: Add more tests

    });

    describe('Interpreter Rules', function () {

        it('hijo(pepe, juan) should be true', function () {
            assert(interpreter.checkQuery('hijo(pepe, juan)') === true);
        });
        it('hija(maria, roberto) should be false', function () {
            assert(interpreter.checkQuery('hija(maria, roberto)') === false);
        });
        it('hijo(pepe, juan) should be true', function () {
            assert(interpreter.checkQuery('hijo(pepe, juan)'));
        });

        // TODO: Add more tests

    });

    describe('Validation and Utility', function() {
       it('padre(mario,pepe) should be valid fact', function() {
          assert(isValidFact('padre(mario,pepe)') === true);
       });
       it('padre[mario,pepe] should not be a valid fact', function(){
           assert(isValidFact('padre[mario,pepe]') === false);
       });
       it('hija(X, Y) :- mujer(X), padre(Y, X) should be valid rule', function() {
           assert(isValidRule('hija(X, Y) :- mujer(X), padre(Y, X)') === true);
       });
       it('hija(X, Y) : mujer(X), padre(Y, X) should not be a valid rule', function(){
           assert(isValidRule('hija(X, Y) : mujer(X), padre(Y, X)') === false);
       });
       it('padre(mario,pepe) should be valid query', function() {
           assert(isValidQuery('padre(mario,pepe)') === true);
       });
       it('padre[mario,pepe] should not be a valid query', function(){
           assert(isValidQuery('padre mario,pepe]') === false);
       });
       it('varon(mario) should be put together as varonmario', function() {
          assert(putTogether('varon(mario)') === 'varonmario');
       });
       it('padre(mario,pepe) should be put together as padremariopepe', function() {
          assert(putTogether('padre(mario,pepe)') === 'padremariopepe');
       });
       it('hijo(X, Y) should get [\'X\', \'Y\']', function() {
          var variables = obtainValuesFromBrackets('hijo(X, Y)');
          assert(variables.length == 2);
          assert(variables[0] == 'X');
          assert(variables[1] == 'Y');
       });
    });


});


