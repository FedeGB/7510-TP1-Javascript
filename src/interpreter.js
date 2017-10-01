var Interpreter = function () {

    this.parseDB = function (inputDB) {
        var result = {'error': false};
        var line = 1;
        inputDB.forEach(function(element) {
            var parsedElement = element.replace(/(\t|\n|\.)/g, '');
            if(isValidFact(parsedElement)) {
                // Process fact
                processValidFact(parsedElement);
            } else if(isValidRule(parsedElement)) {
                // Process rule
                processValidRule(parsedElement);
            } else {
                result = {'error': true, 'element': parsedElement, 'line': line};
            }
            line++;
        });
        return result;
    }

    this.checkQuery = function (params) {
        return true;
    }

}

isValidFact = function(inputElement) {
    var matches = inputElement.match(/^[^\(]*\([^)]*\)$/g);
    if(matches === null) {
        return false;
    }
    return true;
};

isValidRule = function(inputElement) {
    var matches = inputElement.match(/^[^\(]*\([^)]*\) :- ([^\(]*\([^)]*\), *)*([^\(]*\([^)]*\))$/g);
    if(matches === null) {
        return false;
    }
    return true;
};

putTogether = function(value) {
    return value.replace(/( *\( *| *\) *| *, *)/g, '');
}

processValidFact = function(fact) {
    var together = putTogether(fact);
    factMap.set(together, 1);
}

processValidRule = function(rule) {
    var parsedRule = rule.replace(/ +/g, '');
    var separated = parsedRule.split(/:-/);
    var ruleSide = separated[0];
    var factSide = separated[1];
    var ruleName = ruleSide.split(/\(/)[0];
    var ruleList = generateRuleList(ruleSide, factSide);
    ruleMap.set(ruleName, ruleList);
}

generateRuleList = function (ruleSide, factSide) {
    var variables = ruleSide.split(/\(/)[1].replace(/\)/g, '').split(/,/g);
    var allFacts = factSide.split(/\) *,/g);
    var processedFacts = allFacts.map(putTogether);
    var ruleList = [];
    ruleList.push(variables.length);
    ruleList = ruleList.concat(variables);
    ruleList = ruleList.concat(processedFacts);
    return ruleList;
}

module.exports = Interpreter;

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

var factMap = new Map();
var ruleMap = new Map();
var inter = new Interpreter();
 inter.parseDB(db);