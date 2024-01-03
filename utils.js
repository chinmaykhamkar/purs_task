// using AWS SDK v3
const {
    RDSDataClient,
    ExecuteStatementCommand,
    BatchExecuteStatementCommand } = require('@aws-sdk/client-rds-data');
const client = new RDSDataClient({ region: 'us-west-2' });

/**
 * function to call the AWS RDS service
 * @param {Object} params 
 * @returns {string}
 */
const callRDSService = async (params) => {
    // AWS-SDK v3 syntax 
    try {
        const command = new ExecuteStatementCommand(params);
        const response = await client.send(command);
        return "Sucessful execution of SQL statement";
    } catch (error) {
        return "Error executing SQL statement";
    }
}

/**
 * function to call the AWS RDS service for batch
 * @param {Object} params
 * @returns {string}
 */
const callRDSBatchService = async (params) => {
    // AWS-SDK v3 syntax
    try {
        const command = new BatchExecuteStatementCommand(params);
        const response = await client.send(command);
        return "Sucessful execution of batch SQL statement";

    } catch (error) {
        return "Error executing batch SQL statement";
    }

}

/**function to validate input parameters 
 * @param {string} payor
 * @param {string} payee
 * @param {integer} amount
 * @param {integer} interactionType (0 for mobile)
 * @param {string} paymentID
 * @param {integer} paymentMethod (0 for fedNow and 1 for card)
 * @param {integer} amount
 * @param {string} ledgerEntryID
 * @param {string} dev (developer ID)
 * @returns {Object} validateParameters object with keys as flag and error 
*/
const validateInput = (
    payor,
    payee,
    amount,
    interactionType,
    paymentID,
    paymentMethod,
    ledgerEntryID,
    dev) => {
    const validateParameters = {
        flag: true,
        error: '',
    }
    if (typeof payor !== 'string') {
        validateParameters.flag = false;
        validateParameters.error = 'payor parameter must be a string';
    }

    if (typeof payee !== 'string') {
        validateParameters.flag = false;
        validateParameters.error = 'payee parameter must be a string';
    }

    if (typeof amount !== 'number') {
        validateParameters.flag = false;
        validateParameters.error = 'amount parameter must be a number';

    }

    if (typeof interactionType !== 'number') {
        validateParameters.flag = false;
        validateParameters.error = 'interactionType parameter must be a number';
    }

    if (typeof paymentID !== 'string') {
        validateParameters.flag = false;
        validateParameters.error = 'paymentID parameter must be a string';
    }

    if (typeof paymentMethod !== 'number') {
        validateParameters.flag = false;
        validateParameters.error = 'paymentMethod parameter must be a number';
    }

    if (paymentMethod !== 0 && paymentMethod !== 1) {
        validateParameters.flag = false;
        validateParameters.error = 'paymentMethod parameter must be 0 or 1';
    }

    if (amount <= 0) {
        validateParameters.flag = false;
        validateParameters.error = 'amount parameter must be greater than 0';
    }

    if (typeof ledgerEntryID !== 'string') {
        validateParameters.flag = false;
        validateParameters.error = 'ledgerEntryID parameter must be a string';
    }

    if (typeof dev !== 'string') {
        validateParameters.flag = false;
        validateParameters.error = 'dev parameter must be a string';
    }
    return validateParameters;
}

/**function to validate fed now input parameters 
 * @param {string} fedNowPaymentID
 * @param {string} payorBankAccountID
 * @param {integer} payeeBankAccountID
 * @returns {Object} validateParameters
*/
const validateFedNowInput = (
    fedNowPaymentID,
    payorBankAccountID,
    payeeBankAccountID) => {

    const validateFedNowParameters = {
        flag: true,
        error: '',
    }
    if (typeof fedNowPaymentID !== 'string') {
        validateFedNowParameters.flag = false;
        validateFedNowParameters.error = 'fedNowPaymentID parameter must be a string';
    }

    if (typeof payorBankAccountID !== 'string') {
        validateFedNowParameters.flag = false;
        validateFedNowParameters.error = 'payorBankAccountID parameter must be a string';
    }

    if (typeof payeeBankAccountID !== 'string') {
        validateFedNowParameters.flag = false;
        validateFedNowParameters.error = 'payeeBankAccountID parameter must be a string';
    }
    return validateFedNowParameters;
}

/**function to validate ledger entry input parameters 
 * @param {string} payor
 * @param {string} payee
 * @param {integer} promoAmount
 * @param {integer} interactionType
 * @param {string} ledgerEntryID
 * @param {string} dev
 * @returns {Object} validateParameters
*/
const validateLedgerEntryInput = (
    payor,
    payee,
    promoAmount,
    interactionType,
    ledgerEntryID,
    dev) => {
    const validateLedgerEntryParameters = {
        flag: true,
        error: '',
    }
    if (typeof payor !== 'string') {
        validateLedgerEntryParameters.flag = false;
        validateLedgerEntryParameters.error = 'payor parameter must be a string';
    }

    if (typeof payee !== 'string') {
        validateLedgerEntryParameters.flag = false;
        validateLedgerEntryParameters.error = 'payee parameter must be a string';
    }

    if (typeof promoAmount !== 'number') {
        validateLedgerEntryParameters.flag = false;
        validateLedgerEntryParameters.error = 'promoAmount parameter must be a number';
    }

    if (promoAmount < 0) {
        validateLedgerEntryParameters.flag = false;
        validateLedgerEntryParameters.error = 'promoAmount parameter must be greater than 0';
    }

    if (typeof interactionType !== 'number') {
        validateLedgerEntryParameters.flag = false;
        validateLedgerEntryParameters.error = 'interactionType parameter must be a number';
    }

    if (typeof ledgerEntryID !== 'string') {
        validateLedgerEntryParameters.flag = false;
        validateLedgerEntryParameters.error = 'ledgerEntryID parameter must be a string';
    }

    if (typeof dev !== 'string') {
        validateLedgerEntryParameters.flag = false;
        validateLedgerEntryParameters.error = 'dev parameter must be a string';
    }
    return validateLedgerEntryParameters;
}

/**
 * function to create a random binary string of a certain length
 * @param {integer} length
 * @returns {string}
 */
const generateRandomBinary = (length) => {
    let binaryString = ''
    for (let i = 0; i < length; i += 1) {
        // generate random binary digit (0 or 1)
        const binaryDigit = Math.round(Math.random());
        // append the digit to binary string
        binaryString += binaryDigit;
    }
    return binaryString;
}

/**
 * function to generate Parameters for AWS RDS
 * @param {string} payor
 * @param {string} payee
 * @param {integer} amount
 * @param {integer} interactionType (0 for mobile)
 * @param {string} paymentID
 * @param {integer} paymentMethod (0 for fedNow and 1 for card)
 * @param {integer} amount
 * @param {string} ledgerEntryID
 * @param {string} dev (developer ID)
 * @returns {Array} parameters (array of Objects)
 **/
const generateParameters = (
    payor,
    payee,
    amount,
    interactionType,
    paymentID,
    paymentMethod,
    ledgerEntryID,
    dev) => {

    // object to validate inputs
    let validateParameters = {
        flag: true, // initially set flag to true to indicate no error
        error: '', // to store error message
    }

    // function to validate inputs
    validateParameters = validateInput(
        payor,
        payee,
        amount,
        interactionType,
        paymentID,
        paymentMethod,
        ledgerEntryID,
        dev);

    if (validateParameters.flag === false) {
        throw new Error(validateParameters.error);
    }
    const parameters = [];
    parameters.push(
        { name: 'payerId', value: { blobValue: Buffer.from(payor, 'hex') } },
        { name: 'payeeId', value: { blobValue: Buffer.from(payee, 'hex') } },
        { name: 'paymentAmount', value: { doubleValue: amount } },
        { name: 'interactionTypeId', value: { doubleValue: interactionType } },
        { name: 'paymentId', value: { blobValue: Buffer.from(paymentID, 'hex') } },
        {
            name: 'datePaid', value: {
                stringValue: paymentMethod === 0 && amount > 0 ? null :
                    new Date()
                        .toISOString()
                        .slice(0, 19)
                        .replace('T', ' '),
                isNull: paymentMethod === 0 && amount > 0
            }
        },
        { name: 'ledgerId', value: { blobValue: Buffer.from(ledgerEntryID, 'hex') } },
        { name: 'developerId', value: { blobValue: Buffer.from(dev, 'hex') } },
        { name: 'paymentMethod', value: { doubleValue: paymentMethod } },
        // the status is set to "completed" if the payment is a card or if the amount is 0;
        // otherwise the status is set to pending(ie. fedNow)
        { name: 'paymentStatus', value: { stringValue: paymentMethod !== 0 || amount === 0 ? "completed" : "pending" } },
    )
    return parameters;
}

/**
 * function to generate Parameters for FedNow
 * @param {Array} params (array of objects)
 * @param {string} fedNowPaymentID
 * @param {string} payorBankAccountID
 * @param {string} payorBankAccountID
 * @returns {Array} params (array of objects)
 **/
const generateFedNowParameters = (
    params,
    fedNowPaymentID,
    payorBankAccountID,
    payeeBankAccountID) => {

    //object to validate inputs
    let validateFedNowParameters = {
        flag: true,
        error: '',
    }

    //function to validate inputs
    validateFedNowParameters = validateFedNowInput(fedNowPaymentID,
        payorBankAccountID,
        payeeBankAccountID);
    if (validateFedNowParameters.flag === false) {
        throw new Error(validateFedNowParameters.error);
    }

    params.push(
        { name: 'fedNowPaymentId', value: { blobValue: Buffer.from(fedNowPaymentID, 'hex') } },
        { name: 'payorBankAccountId', value: { blobValue: Buffer.from(payorBankAccountID, 'hex') } },
        { name: 'payeeBankAccountId', value: { blobValue: Buffer.from(payeeBankAccountID, 'hex') } },
    )

    return params;
}

/**
 * function to generate Parameters for AWS RDS for Ledger Entry
 * @param {string} payor
 * @param {string} payee
 * @param {integer} promoAmount
 * @param {integer} interactionType
 * @param {string} ledgerEntryID
 * @param {string} dev
 * @returns {Array} parameters (array of objects)
 **/
const generateLedgerEntryParameters = (
    payor,
    payee,
    promoAmount,
    interactionType,
    ledgerEntryID,
    dev) => {

    // object to validate inputs    
    let validateLedgerEntryParameters = {
        flag: true,
        error: '',
    }

    // function to validate inputs
    validateLedgerEntryParameters = validateLedgerEntryInput(
        payor,
        payee,
        promoAmount,
        interactionType,
        ledgerEntryID,
        dev);
    if (validateLedgerEntryParameters.flag === false) {
        throw new Error(validateLedgerEntryParameters.error);
    }
    const parameters = [];
    parameters.push(
        { name: 'payerId', value: { blobValue: Buffer.from(payor, 'hex') } },
        { name: 'payeeId', value: { blobValue: Buffer.from(payee, 'hex') } },
        { name: 'amount', value: { doubleValue: promoAmount } },
        { name: 'interactionTypeId', value: { doubleValue: interactionType } },
        { name: 'ledgerId', value: { blobValue: Buffer.from(ledgerEntryID, 'hex') } },
        { name: 'developerId', value: { blobValue: Buffer.from(dev, 'hex') } },
    )
    return parameters;
}

/**
 * function to generate Parameters for AWS RDS for Purs Payment
 * @param {Array} ledgeEntries
 * @param {string} pursTransactionID
 * @returns {Array} parameterSets (array of objects)
 **/
const generatePursPaymentParameters = (
    ledgeEntries,
    pursTransactionID) => {

    if (typeof pursTransactionID !== 'string') {
        throw new Error('pursTransactionID must be a string')
    }

    const parameterSets = ledgeEntries.map((pursPayment) => [
        { name: 'transactionId', value: { blobValue: Buffer.from(pursTransactionID, 'hex') } },
        { name: 'ledgerId', value: { blobValue: Buffer.from(pursPayment, 'hex') } }
    ]);
    return parameterSets;
}

module.exports = {
    callRDSService,
    callRDSBatchService,
    validateInput,
    validateFedNowInput,
    validateLedgerEntryInput,
    generateRandomBinary,
    generateParameters,
    generateFedNowParameters,
    generateLedgerEntryParameters,
    generatePursPaymentParameters
}