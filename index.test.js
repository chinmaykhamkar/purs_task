const index = require('./index');
const utils = require('./utils');

//mocking all the functions from index.js
jest.mock('./utils');

// mocking the main executeStandardPTOperations function
describe('test cases for executeStandardPTOperations function', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    //assign userPurchaseInformation
    var userPurchaseInformation = {
        payor: 'payor',
        payee: 'payee',
        payorBankAccountID: 'payorBankAccountID',
        payeeBankAccountID: 'payeeBankAccountID',
        dev: 'dev',
        amount: 100,
        interactionType: 0,
        paymentMethod: 0 //fedNowPayment
    };

    // assign mock return values
    utils.generateParameters.mockReturnValue([]);
    utils.callRDSService.mockResolvedValue();
    utils.callRDSBatchService.mockResolvedValue();
    const sqlTransactionID = 'sqlTransactionID';

    // test to check if response is an object
    test('test to check if response is an object', async () => {
        const promotionInformation = {
            promoAmount: 0
        };
        utils.generateRandomBinary.mockReturnValueOnce('101011010');
        const response = await index.executeStandardPTOperations(userPurchaseInformation,
            promotionInformation,
            sqlTransactionID);
        expect(response).toBeInstanceOf(Object);
    });

    /*test to check the correct number of various function
     *calls with paymentMethod as fedNowPayment(=0), amount > 0 and promoAmount = 0
     */
    test(`test to check the count of function calls with fedNowPayment, 
          amount > 0 and promoAmount = 0 and correct returned object`, async () => {

        const promotionInformation = {
            promoAmount: 0
        };
        utils.generateRandomBinary
            .mockReturnValueOnce('1010110') //primaryPaymentID
            .mockReturnValueOnce('0101101') //customerLedgerEntryID
            .mockReturnValueOnce('1010110') //primaryFedNowPaymentID
            .mockReturnValueOnce('0011011') // pursTransactionID

        const response = await index.executeStandardPTOperations(
            userPurchaseInformation,
            promotionInformation,
            sqlTransactionID);
            
        expect(utils.generateRandomBinary).toHaveBeenCalledTimes(4); // generateRandomBinary is called 4 times
        expect(utils.callRDSService).toHaveBeenCalledTimes(3); // callRDSService is called 3 times 
        expect(utils.callRDSBatchService).toHaveBeenCalledTimes(1); // callRDSBatchService is called 1 time

        expect(response).toEqual({
            primaryPaymentID: '1010110',
            customerLedgerEntryID: '0101101',
            primaryFedNowPaymentID: '1010110',
            pursTransactionID: '0011011'
        })
    });

    /*test to check the correct number of various function
    *calls with paymentMethod as fedNowPayment(=0), amount > 0 and promoAmount > 0
    */
    test(`test to check the count of function calls with fedNowPayment, 
          amount > 0 and promoAmount > 0 and correct returned object`, async () => {

        const promotionInformation = {
            promoAmount: 100 // promoAmount non zero
        };
        utils.generateRandomBinary
            .mockReturnValueOnce('1010110') //primaryPaymentID
            .mockReturnValueOnce('0101101') //customerLedgerEntryID
            .mockReturnValueOnce('1010110') //primaryFedNowPaymentID
            .mockReturnValueOnce('0011111') //promotionLedgerEntryID
            .mockReturnValueOnce('0011011') //pursTransactionID

        const response = await index.executeStandardPTOperations(
            userPurchaseInformation,
            promotionInformation,
            sqlTransactionID);

        expect(utils.generateRandomBinary).toHaveBeenCalledTimes(5); // generateRandomBinary is called 5 times
        expect(utils.callRDSService).toHaveBeenCalledTimes(4); // callRDSService is called 3 times 
        expect(utils.callRDSBatchService).toHaveBeenCalledTimes(1); // callRDSBatchService is called 1 time

        expect(response).toEqual({
            primaryPaymentID: '1010110',
            customerLedgerEntryID: '0101101',
            primaryFedNowPaymentID: '1010110',
            promotionLedgerEntryID: '0011111',
            pursTransactionID: '0011011'
        })
    });

    /*test to check the correct number of various function
    *calls with only promoAmount > 0
    */
    test('test to check the count of function calls with only promoAmount > 0 and returned object', async () => {

        const promotionInformation = {
            promoAmount: 100
        };
        userPurchaseInformation.amount = 0;
        utils.generateRandomBinary
            .mockReturnValueOnce('1010110') //primaryPaymentID
            .mockReturnValueOnce('0101101') //customerLedgerEntryID
            .mockReturnValueOnce('0011111') //promotionLedgerEntryID
            .mockReturnValueOnce('0011011') //pursTransactionID

        const response = await index.executeStandardPTOperations(
            userPurchaseInformation,
            promotionInformation,
            sqlTransactionID);

        expect(utils.generateRandomBinary).toHaveBeenCalledTimes(4); // generateRandomBinary is called 3 times
        expect(utils.callRDSService).toHaveBeenCalledTimes(3); // callRDSService is called 2 times 
        expect(utils.callRDSBatchService).toHaveBeenCalledTimes(1); // callRDSBatchService is called 1 time

        expect(response).toEqual({
            primaryPaymentID: '1010110',
            customerLedgerEntryID: '0101101',
            promotionLedgerEntryID: '0011111',
            pursTransactionID: '0011011'
        });
    });

    /*test to check the correct number of various function with no special case*/
    test('test to check the count of function calls with no special case and returned object', async () => {

        const promotionInformation = {
            promoAmount: 0
        };
        userPurchaseInformation.amount = 0;
        utils.generateRandomBinary
            .mockReturnValueOnce('1010110') //primaryPaymentID
            .mockReturnValueOnce('0101101') //customerLedgerEntryID
            .mockReturnValueOnce('0011011') //pursTransactionID

        const response = await index.executeStandardPTOperations(
            userPurchaseInformation,
            promotionInformation,
            sqlTransactionID);

        expect(utils.generateRandomBinary).toHaveBeenCalledTimes(3); // generateRandomBinary is called 3 times
        expect(utils.callRDSService).toHaveBeenCalledTimes(2); // callRDSService is called 2 times 
        expect(utils.callRDSBatchService).toHaveBeenCalledTimes(1); // callRDSBatchService is called 1 time
        
        expect(response).toEqual({
            primaryPaymentID: '1010110',
            customerLedgerEntryID: '0101101',
            pursTransactionID: '0011011'
        })
    });

});