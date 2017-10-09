var factMap = new Map();
var ruleMap = new Map();

var Interpreter = function () {

    // Function that parses the DB input. This funciton will return an object with an 'error' value
    // If the value is true, a 'line' and 'element' will also be set to specify the line and element
    // that is failing. If every entry of the DB passes validation the 'error' value will be false
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

    // It process a query based on the previously parsed DB.
    // This means that the parseDB function should be called first
    // Nothing will be processed because the DB will be empty otherwise.
    this.checkQuery = function (query) {
        if(isValidQuery(query)) {
            return processQuery(query);
        } else {
            return false;
        }
    }

}

// Validation of an element, it will return true if the element is a valid Fact
// Example of a valid fact: 'fact(x,y)', spaces are also considered valid.
isValidFact = function(inputElement) {
    var matches = inputElement.match(/^[^\(]*\([^)]*\)$/g);
    if(matches === null) {
        return false;
    }
    return true;
};

// Validation of an element, it will return true if the element is a valid Rule
// Example of a valid rule: 'rule :- fact1(x), fact2(y,z)', spaces are also considered valid in between
isValidRule = function(inputElement) {
    var matches = inputElement.match(/^[^\(]*\([^)]*\) :- ([^\(]*\([^)]*\), *)*([^\(]*\([^)]*\))$/g);
    if(matches === null) {
        return false;
    }
    return true;
};

// Similar to isValidFact, but this is taken apart if in a future it's needed
// to distinct between fact and query (special characters to use and more).
isValidQuery = function(inputQuery) {
  var matches = inputQuery.match(/^[^\(]*\([^)]*\)$/g);
  if(matches == null) {
      return false;
  }
  return true;
};

// This function removes from a string the characters '(', ')' or ','
// This also includes spaces that are near the character
putTogether = function(value) {
    return value.replace(/( *\( *| *\) *| *, *)/g, '');
}

// This process a valid fact, which was validated previously
// Processed fact is added to the factMap.
processValidFact = function(fact) {
    var together = putTogether(fact);
    factMap.set(together, 1);
}

// This process a valid rule, which was validated previously
// Processed rules are added to the ruleMap
processValidRule = function(rule) {
    var parsedRule = rule.replace(/ +/g, '');
    var separated = parsedRule.split(/:-/);
    var ruleSide = separated[0];
    var factSide = separated[1];
    var ruleName = ruleSide.split(/\(/)[0];
    var ruleList = generateRuleList(ruleSide, factSide);
    ruleMap.set(ruleName, ruleList);
}

// This generates the 'rule list'. Rule list consists of the parts of a rule.
// For example: [2, 'X', 'Y', 'fact1X', 'fact2YX'], where the first element
// of the list is the amount of variables that the rule has, the following are the
// variables names that the rule take, in this example it's 2, so the following 2 are variables
// The rest of the list are the facts that conform the rule and need to get evaluated.
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

// First level to process a query. This will return if the query is true or false.
// It will evaluate if it's a fact, if it's not it will evalute it as a rule.
processQuery = function(query) {
    if(factMap.has(putTogether(query))) {
        return true;
    } else {
        return evaluateQueryRule(query);
    }

}

// Second level, if the query was not a fact, then it's a rule.
// At this level we parse the query to get the rule name, if the rule
// does not exist this will return false, if it does we have to evaluate the rule conditions
evaluateQueryRule = function(query) {
    var parsedQuery = query.replace(/ +/g, '');
    var ruleName = parsedQuery.split(/\(/)[0];
    if(ruleMap.has(ruleName)) {
        var queryRuleValues = obtainValuesFromBrackets(query);
        return evaluateRuleConditions(ruleMap.get(ruleName), queryRuleValues);
    } else {
        return false;
    }
}

// Third level with pre evaluation of the rule conditinos (the facts).
// We evaluate if the variables amount is the same as in the rule
// If it does not match this returns false, if it does check the ruel facts
evaluateRuleConditions = function(conditions, queryValues) {
    if(conditions[0] == queryValues.length) {
        return checkRuleFacts(conditions, queryValues);
    } else {
        return false;
    }
}

// Final level, checking the rule facts.
// At this level we map the variables passed in the query to the
// facts of the rule and check if the facts are in the factMap
// If all the facts are in the factMap we return true, if any of the facts
// is not on the fact Map this will return false
checkRuleFacts = function(conditions, queryValues) {
    var varsAmount = conditions[0];
    var replacedFacts = [];
    for(var itFacts = 1 + varsAmount; itFacts < conditions.length; itFacts++) {
        var replacedRuleFact = conditions[itFacts];
        for(var itVars = 1; itVars <= varsAmount; itVars++) {
            var varActual = conditions[itVars];
            var valueActual = queryValues[itVars-1];
            replacedRuleFact = replacedRuleFact.replace(new RegExp(varActual, 'g'), valueActual);
        }
        replacedFacts.push(replacedRuleFact);
    }
    var queryResult = true;
    replacedFacts.forEach(function(fact) {
        if(!factMap.has(fact)) {
            queryResult = false;
        }
    });
    return queryResult;
}

// Function to obtain te values in between brackets
// An array with the values will be returned.
obtainValuesFromBrackets = function(query) {
    query = query.replace(/ +/g, '');
    var varsSide = query.split(/\(/)[1];
    var parsedSide = varsSide.replace(/\)/g, '');
    var ruleVars = parsedSide.split(/,/g);
    return ruleVars;
}

// Getter for the factMap. This function is merely used for testing
// The map should not be altered externally
getFactMap = function() {
    return factMap;
}

// Getter for the ruleMap. This function is merely used for testing
// The map should not be altered externally
getRuleMap = function() {
    return ruleMap;
}

module.exports = Interpreter;