var testUtils = require('jive-testing-framework/testUtils');
var jive = require('jive-sdk');

var makeRunner = function() {
    return testUtils.makeRunner( {
        'eventHandlers' : {
            'onTestStart' : function(test) {
//                test['ctx']['persistence'] = new jiveMongo({
//                    'databaseUrl' : 'mongoTestDB'
//                });
            },
            'onTestEnd' : function(test) {
//                test['ctx']['persistence'].destroy();
            }
        }
    });
};

makeRunner().runTests(
    {
        'context' : {
            'testUtils' : testUtils,
            'jive' : jive
        },
        'rootSuiteName' : 'jive',
        'runMode' : 'test',
        'testcases' : process.cwd()  + '/library',
        'timeout' : 5000,
        'reporter': "spec"
    }
).then( function(allClear) {
    if ( allClear ) {
        process.exit(0);
    } else {
        process.exit(-1);
    }
});