const utils = require('../utils');

// mocking the callRDSService and callRDSBatchService functions
// and keeping the rest of the functions as they are from utils.js
jest.mock('../utils.js', () => {
    const original = jest.requireActual('../utils.js');
    return {
        ...original,
        callRDSService: jest.fn(),
        callRDSBatchService: jest.fn()
    }
});

/*test cases to test the callRDSService function which in turn calls the ExecuteStatementCommand from AWS RDS*/
describe('test cases for callRDSService function', () => {

    // test the callRDSService function with sucessful execution
    // note - in this test we pass an empty object to callRDSService and mock its return value 
    // to be 'Sucessful execution of SQL statement' which is what we expect
    test('should handle successful execution of callRDSService function', async () => {
        utils.callRDSService.mockReturnValue(Promise.resolve("Sucessful execution of SQL statement"));

        const response = await utils.callRDSService({});
        expect(response).toBe('Sucessful execution of SQL statement');
    });

    // test the callRDSService function which returns an error
    test('should handle error condtion of callRDSService function', async () => {

        // similar to the above test we mock the callRDSService function to return an error
        const error = new Error('Error executing SQL statement');
        utils.callRDSService.mockReturnValue(error);

        const response = await utils.callRDSService({});
        expect(response).toBe(error);
    });
});

/*test cases to test the callRDSBatchService function which in turn calls the BatchExecuteStatementCommand from AWS RDS*/
describe('test cases for callRDSBatchService function', () => {

    // test the callRDSBatchService function with sucessful execution
    // note - in this test we pass an empty object to callRDSBatchService and mock its return value 
    // to be 'Sucessful execution of batch SQL statement' which is what we expect
    test('should handle successful execution of callRDSBatchService function', async () => {
        utils.callRDSBatchService.mockReturnValue(Promise.resolve("Sucessful execution of batch SQL statement"));

        const response = await utils.callRDSBatchService({});
        expect(response).toBe('Sucessful execution of batch SQL statement');
    });

    // test the callRDSBatchService function which returns an error
    test('should handle error condtion of callRDSBatchService function', async () => {

        // similar to the above test we mock the callRDSBatchService function to return an error
        const error = new Error('Error executing SQL statement');
        utils.callRDSBatchService.mockReturnValue(error);

        const response = await utils.callRDSBatchService({});
        expect(response).toBe(error);
    });
});

/* test cases for random binary string generator */
describe('test cases for generateRandomBinary function', () => {

    // test to check if binary string is of correct length
    test('generates a binary string of the correct length', () => {
        const length = 10;
        const result = utils.generateRandomBinary(length);

        expect(result.length).toBe(length);
    });

    // test to check if binary string is valid (only contains 0s and 1s)
    test('generates a binary string with a valid binary format', () => {
        const length = 10;
        const result = utils.generateRandomBinary(length);
        const isValidBinary = /^[01]+$/.test(result);

        expect(isValidBinary).toBe(true);
    });

    // test to check for empty string
    test('generates a binary string with length zero', () => {
        const length = 0;
        const result = utils.generateRandomBinary(length);

        expect(result).toBe('');
    })

    // test to handle non-integer values
    test('handles non-integer values', () => {
        const result = utils.generateRandomBinary('string_input');

        expect(result).toBe('');
    })
});

/* test cases for generateParameters function */
describe('test cases generateParameters', () => {

    //test to check if parameters are valid inputs
    test('generates parameters with valid inputs', () => {

        const parameters = utils.generateParameters(
            'payor', //payor
            'payee', //payee
            100, //amount
            0, //interactionType
            'paymentID', //paymentID
            0, //paymentMethod (0 for fedNow and 1 for card)                                                    
            'ledgerEntryID', //ledgerEntryID
            'dev'); //devloper ID

        expect(parameters).toHaveLength(10);
        expect(parameters).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'payerId', value: { blobValue: expect.any(Buffer) } },
                { name: 'payeeId', value: { blobValue: expect.any(Buffer) } },
                { name: 'paymentAmount', value: { doubleValue: 100 } },
                { name: 'interactionTypeId', value: { doubleValue: 0 } },
                { name: 'paymentId', value: { blobValue: expect.any(Buffer) } },
                { name: 'datePaid', value: { stringValue: expect.any(String), isNull: false } },
                { name: 'ledgerId', value: { blobValue: expect.any(Buffer) } },
                { name: 'developerId', value: { blobValue: expect.any(Buffer) } },
                { name: 'paymentMethod', value: { doubleValue: 0 } },
                { name: 'paymentStatus', value: { stringValue: 'pending' } }),
        ]));
    });

    // generates paymentStatus === completed based on values of paymentMethod(!==0) or amount(===0)
    test('generates correct paymentStatus based on values of paymentMethod and amount', () => {

        const parameters = utils.generateParameters(
            'payor',
            'payee',
            100,
            0,
            'paymentID',
            1, //paymentMethod set to 1                                               
            'ledgerEntryID',
            'dev');

        expect(parameters).toHaveLength(10);
        expect(parameters).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'paymentStatus', value: { stringValue: 'completed' } }),
        ]));
    });
    // test cases for invalid input tested in the next test
});

/* test cases for validateInput function */
describe('test cases validateInput', () => {

    // test to check parameters with invalid inputs
    test('amount value is not a string', () => {
        const parameters = utils.validateInput(
            'payor',
            'payee',
            'amount', // amount is a string
            0,
            'paymentID',
            0,
            'ledgerEntryID',
            'dev');

        expect(parameters).toEqual({ flag: false, error: "amount parameter must be a number" });
    });

    test('paymentMethod value is not a binary number', () => {
        const parameters = utils.validateInput(
            'payor',
            'payee',
            100,
            0,
            'paymentID',
            3, //paymentMethod is not a binary number                                                   
            'ledgerEntryID',
            'dev');

        expect(parameters).toEqual({ flag: false, error: "paymentMethod parameter must be 0 or 1" });
    });
});

/* test cases for generateFedNowParameters function */
describe('test cases generateFedNowParameters', () => {

    // test to check parameters with valid inputs
    test('generates FedNowParameters with valid inputs', () => {

        const parameters = utils.generateFedNowParameters([],
            'fedNowPaymentID',
            'payorBankAccountID',
            'payeeBankAccountID');
            
        expect(parameters).toEqual(expect.arrayContaining([
            expect.objectContaining(
                { name: 'fedNowPaymentId', value: { blobValue: expect.any(Buffer) } },
                { name: 'payorBankAccountID', value: { blobValue: expect.any(Buffer) } },
                { name: 'payeeBankAccountID', value: { blobValue: expect.any(Buffer) } }),
        ]));
    });
    // test cases for invalid input tested in the next test
});

/* test cases for validateFedNowInput function */
describe('test cases validateFedNowInput', () => {

    // test to check parameters with invalid inputs
    test('payorBankAccountID value is not a string', () => {
        const parameters = utils.validateFedNowInput(
            'fedNowPaymentID',
            100, // payorBankAccountID as integer
            'payeeBankAccountID');

        expect(parameters).toEqual({ flag: false, error: "payorBankAccountID parameter must be a string" });
    });

    test('fedNowPaymentID value is not a string', () => {
        const parameters = utils.validateFedNowInput(
            100, //fedNowPaymentID as integer
            'payorBankAccountID',
            'payeeBankAccountID');

        expect(parameters).toEqual({ flag: false, error: "fedNowPaymentID parameter must be a string" });
    });

    test('payeeBankAccountID value is not a string', () => {
        const parameters = utils.validateFedNowInput(
            'fedNowPaymentID',
            'payorBankAccountID',
            100); //payeeBankAccountID as integer

        expect(parameters).toEqual({ flag: false, error: "payeeBankAccountID parameter must be a string" });
    });
});

/* test cases for generateLedgerEntryParameters function */
describe('test cases generateLedgerEntryParameters', () => {

    // test to check parameters with valid inputs
    test('generates LedgerEntryParameters with valid inputs', () => {
        const parameters = utils.generateLedgerEntryParameters(
            'payor', //payor
            'payee', //payee
            500, //promo amount
            0, // interactionType
            'ledgerEntryID', //ledgerEntryID
            'dev'); //devloper ID

        expect(parameters).toHaveLength(6);
        expect(parameters).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'payerId', value: { blobValue: expect.any(Buffer) } },
                { name: 'payeeId', value: { blobValue: expect.any(Buffer) } },
                { name: 'amount', value: { doubleValue: 500 } },
                { name: 'interactionType', value: { doubleValue: 0 } },
                { name: 'ledgerId', value: { blobValue: expect.any(Buffer) } },
                { name: 'developerId', value: { blobValue: expect.any(Buffer) } }),
        ]))

    });
    // test cases for invalid input tested in the next test
});

/* test cases for validateLedgerEntryInput function */
describe('test cases validateLedgerEntryInput', () => {

    // test to check parameters with invalid inputs
    test('payor value is not a string', () => {
        
        const parameters = utils.validateLedgerEntryInput(
            100, //payor as integer
            'payee',
            500,
            0,
            'ledgerEntryID',
            'dev');
            
        expect(parameters).toEqual({ flag: false, error: "payor parameter must be a string" });
    });

    test('promoAmount value is not a number', () => {

        const parameters = utils.validateLedgerEntryInput(
            'payor',
            'payee',
            'promo', //promo amount as string
            0,
            'ledgerEntryID',
            'dev');

        expect(parameters).toEqual({ flag: false, error: "promoAmount parameter must be a number" });
    });
});

/*test cases for generatePursPaymentParameters function*/
describe('test cases generatePursPaymentParameters', () => {

    //test to check parameters with valid inputs
    const ledgeEntries = ['ledgerEntryID1', 'ledgerEntryID2', 'ledgerEntryID3'];
    test('generates PursPaymentParameters with valid inputs', () => {
        const parameters = utils.generatePursPaymentParameters(ledgeEntries, //ledgeEntries
            'pursTransactionID'); //pursTransactionID

        expect(parameters).toHaveLength(3);
        expect(parameters).toEqual(expect.arrayContaining([
            expect.arrayContaining([
                expect.objectContaining({ name: 'transactionId', value: { blobValue: expect.any(Buffer) } },
                    { name: 'ledgerId', value: { blobValue: expect.any(Buffer) } }),
            ])
        ]));
    });

    // test case with invalid input
    test('pursTransactionID value is not a string', () => {
        
        expect(() => {
            utils.generatePursPaymentParameters(ledgeEntries, 100) // pursTransactionID as integer
        }).toThrowError('pursTransactionID must be a string');
    });
});




