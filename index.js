// importing helper functions from util.js
const { 
    generateRandomBinary,
    callRDSService,
    callRDSBatchService,
    generateParameters,
    generateFedNowParameters,
    generateLedgerEntryParameters,
    generatePursPaymentParameters } = require('./utils');

/**
 * creates everything necessary to record a transaction bundle in RDS database
 *
 * A PTB (Purs Transaction Bundle) is a bundle of database records that are created as part of a Purs Transaction.
 * A single Transaction may include a promotion, it may include a Payment, it may include a fedNowPayment,
 *  but it always includes at least one LedgerEntry
 * @param {Object} userPurchaseInformation
 * @param {string} userPurchaseInformation.payor the id of the entity paying
 * @param {string} userPurchaseInformation.payee the id of the entity getting paid
 * @param {string} userPurchaseInformation.payorBankAccountID the bank account id of the entity paying
 * @param {string} userPurchaseInformation.payeeBankAccountID the bank account id of the entity getting paid
 * @param {string} userPurchaseInformation.dev the id of the developer
 * @param {integer} userPurchaseInformation.amount the amount being paid
 * @param {integer} userPurchaseInformation.interactionType 0 is mobile
 * @param {integer} userPurchaseInformation.paymentMethod 0 is fedNow 1 is card
 *
 * @param {Object}  promotionInformation
 * @param {integer}  promotionInformation.promoAmount if there is a promotion put an amount here
 * @param {string} sqlTransactionID the id of the sql transaction
 * @returns an Object with the ledger entry id and the payment id
 */

const executeStandardPTOperations = async (
    userPurchaseInformation,
    promotionInformation,
    sqlTransactionID) => {
        
    // extracting userPurchaseInformation Object
    const {
        payor,
        payee,
        payorBankAccountID,
        payeeBankAccountID,
        dev,
        amount,
        interactionType,
        paymentMethod
    } = userPurchaseInformation;

    //assign SQL queries
    const insertPaymentSQL = 'insert payment query';
    const insertLedgerEntrySQL = 'insert ledger entry query';
    const insertFedNowPaymentSQL = 'insert fednow payment query';
    const insertPromoLedgerEntrySQL = 'insert promo ledger entry query';
    const insertTransactionSQL = 'insert transaction query';

    // extracting promotionInformation Object
    const { promoAmount } = promotionInformation;
    const ledgeEntries = [];

    // generate random binary string for paymentID and ledgerEntryID
    const paymentID = generateRandomBinary(32);
    // using 'let' to assign ledgerEntryID as its value is reassigned later
    let ledgerEntryID = generateRandomBinary(32);

    // create idObject to store all type of IDs
    const idObject = {
        primaryPaymentID: paymentID,
        customerLedgerEntryID: ledgerEntryID,
    }

    ledgeEntries.push(ledgerEntryID);

    // create params objects to store AWS RDS secrets
    const params = {
        database: process.env.DATABASE,
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        transactionId: sqlTransactionID,
    }

    // generateParameters function to generate parameters for AWS RDS
    params.parameters = generateParameters(
        payor,
        payee,
        amount,
        interactionType,
        paymentID,
        paymentMethod,
        ledgerEntryID,
        dev);

    params.parameters = [...params.parameters];
    params.sql = insertPaymentSQL;

    // call AWS RDS service function with params
    await Promise.resolve(callRDSService(params));

    // this is an additional step for processing fedNow payments
    if (paymentMethod === 0 && amount > 0) {
        const fedNowPaymentID = generateRandomBinary(32);
        params.parameters = [...params.parameters];

        // generateParameters function to generate parameters
        params.parameters = generateFedNowParameters(
            params.parameters,
            fedNowPaymentID,
            payorBankAccountID,
            payeeBankAccountID);
        params.sql = insertFedNowPaymentSQL;

        await Promise.resolve(callRDSService(params));

        idObject.primaryFedNowPaymentID = fedNowPaymentID;
    }

    params.sql = insertLedgerEntrySQL;

    await Promise.resolve(callRDSService(params));

    if (promoAmount > 0) {
        // generate new ledgerEntryID when promoAmount is greater than 0
        ledgerEntryID = generateRandomBinary(32);
        ledgeEntries.push(ledgerEntryID);

        // function to generate Parameters for AWS RDS for Ledger Entry
        params.parameters = generateLedgerEntryParameters(
            payor,
            payee,
            promoAmount,
            interactionType,
            ledgerEntryID,
            dev);
        params.sql = insertPromoLedgerEntrySQL;

        await Promise.resolve(callRDSService(params));

        idObject.promotionLedgerEntryID = ledgerEntryID;
    }

    const pursTransactionID = generateRandomBinary(32);

    //function to generate paramentersSet for Purs Payment
    params.parameterSets = generatePursPaymentParameters(
        ledgeEntries,
        pursTransactionID);

    delete params.parameters;
    params.sql = insertTransactionSQL;
    
    //call AWS RDS batch service function with params
    await Promise.resolve(callRDSBatchService(params));

    idObject.pursTransactionID = pursTransactionID;
    return idObject;
}

module.exports = { executeStandardPTOperations };