## purs assesment
### Setup and testing instrcutions
- clone this repo
- run ``` npm install ```
- this should install necessary aws-sdk packages and Jest for testing
- run ``` npm test ``` to run the unit tests
### Project structure 
- the root folder has
  - ``` espto.js ``` - original file
  - ``` index.js ``` - refactored file
  - ``` utils.js ``` - files with helper functions
- the test folder has
  - ``` index.test.js ``` - test file to test the index.js
  - ``` utils.test.js ``` - test file to test the utils.js
### Assumptions 
- I have assumed that the call to AWS RDS service is a valid one and mocked this call accordingly in the unit tests.
### Bug fixes, Improvements and design decisions
- I have used AWS-SDK V3 while implementing this as AWS has encouraged developers to switch from V2 to V3.
- The major change from V2 to V3 is that in V2 the entire AWS module is imported with ``` const AWS = require('aws-sdk') ``` whereas in V3 ``` const { RDSDataClient, ExecuteStatementCommand } = require('@aws- 
  sdk/client-rds-data') ``` so importing only the necessary packages. This decreases the size of the application and in turn could give performance improvements at scale.
- I have created a separate file ``` utils.js ``` which has all the helper functions used in ``` index.js ```. The reason to do this is to make code clean, readable and maintainable by reducing big blocks of code
  to function calls.
- This also helps with testing the code since all the helper functions are together in one file, I wrote a separate ``` utils.test.js ``` to cover all the tests for these helper functions.
- I also have a ``` index.test.js ``` file to test the main function call to the ```executeStandardPTOperations``` function. In this, I have mocked the behaviour of all the other functions present in this file to 
  test if the expected output matches with the received one.
- NIT :- the ```executeStandardPTOperations``` function returns an Object instead of Array as mentioned on line 22 of ```espto.js``` file.
- NIT :- changed the name of return variable from ```idObj``` to ```idObject```
- NIT :- on line 167 of ```espto.js```, for ````name:'payerId'``` the blobValue should take value ```payor``` instead of ```dev``` so I have made that change
- On line 115, and 116 of ```espto.js```, it is mentioned that value of paymentStatus is set to 'completed' or 'pending' but in the ternary operator is ``4:5```. So changed that line from ``` doubleValue: 
  paymentMethod !== 0 || amount === 0 ? 4 : 5,``` to ``` stringValue: paymentMethod !== 0 || amount === 0 ? "completed" : "pending" ```


  
