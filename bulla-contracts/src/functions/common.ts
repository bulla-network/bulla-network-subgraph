import { Address, BigInt, Bytes, dataSource, ethereum } from "@graphprotocol/graph-ts";
import { encode } from "as-base58/assembly/index";
import { ClaimCreatedClaimAttachmentStruct } from "../../generated/BullaClaimERC721/BullaClaimERC721";
import { ERC20 } from "../../generated/BullaClaimERC721/ERC20";
import { BullaFactoringV0 } from "../../generated/BullaFactoringV0/BullaFactoringV0";
import { BullaFactoringV1 } from "../../generated/BullaFactoringV1/BullaFactoringV1";
import { BullaManager as BullaManagerContract } from "../../generated/BullaManager/BullaManager";
import { LoanOfferedLoanOfferAttachmentStruct } from "../../generated/FrendLend/FrendLend";
import {
  BullaManager,
  FactoringPricePerShare,
  FactoringStatisticsEntry,
  HistoricalFactoringStatistics,
  PnlHistoryEntry,
  PoolPnl,
  PriceHistoryEntry,
  Token,
  User,
} from "../../generated/schema";
import { BullaFactoringV2_1 } from "../../generated/BullaFactoringV2_1/BullaFactoringV2_1";
import { BullaFactoringV2_2 } from "../../generated/BullaFactoringV2_2/BullaFactoringV2_2";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const EMPTY_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const CLAIM_TYPE_INVOICE = "Invoice";
export const CLAIM_TYPE_PAYMENT = "Payment";

export const CLAIM_STATUS_PENDING = "Pending";
export const CLAIM_STATUS_REJECTED = "Rejected";
export const CLAIM_STATUS_RESCINDED = "Rescinded";
export const CLAIM_STATUS_REPAYING = "Repaying";
export const CLAIM_STATUS_PAID = "Paid";
export const CLAIM_STATUS_IMPAIRED = "Impaired";

export const CLAIM_BINDING_UNBOUND = "Unbound";
export const CLAIM_BINDING_PENDING = "BindingPending";
export const CLAIM_BINDING_BOUND = "Bound";

export const CLAIM_BINDING_ENUM_UNBOUND = 0;
export const CLAIM_BINDING_ENUM_BINDING_PENDING = 1;
export const CLAIM_BINDING_ENUM_BOUND = 2;

export const BULLA_CLAIM_VERSION_V1 = "V1";
export const BULLA_CLAIM_VERSION_V2 = "V2";

/**
 * Converts ClaimBinding enum value (uint8) from contract to GraphQL string enum
 * @param bindingValue - The numeric enum value from the smart contract (0, 1, or 2)
 * @returns The corresponding string value for the GraphQL schema
 */
export const getClaimBindingFromEnum = (bindingValue: i32): string => {
  if (bindingValue === CLAIM_BINDING_ENUM_UNBOUND) return CLAIM_BINDING_UNBOUND;
  if (bindingValue === CLAIM_BINDING_ENUM_BINDING_PENDING) return CLAIM_BINDING_PENDING;
  if (bindingValue === CLAIM_BINDING_ENUM_BOUND) return CLAIM_BINDING_BOUND;
  return CLAIM_BINDING_UNBOUND;
};

export const multihashStructToBase58 = (hash: Bytes, size: u32, hashFunction: u32): string => {
  const hashBuffer = new Uint8Array(34);
  hashBuffer[0] = hashFunction;
  hashBuffer[1] = size;
  for (let i = 0; i < 32; i++) {
    hashBuffer[i + 2] = hash[i];
  }
  // hashBuffer.set(hash, 2);

  return encode(hashBuffer);
};

export const hexStringToLowercase = (hexString: string): string => {
  const capitalHexChars = "ABCDEF";
  const lowercaseHexChars = "abcdef";
  let stringArray = hexString.split("");

  for (let i = 0; i < stringArray.length; i++) {
    let capitalCharIndex = capitalHexChars.indexOf(stringArray[i]);
    if (capitalCharIndex !== -1) {
      stringArray[i] = lowercaseHexChars.charAt(capitalCharIndex);
    }
  }
  return stringArray.join("");
};

export const getIPFSHash_claimCreated = (attachment: ClaimCreatedClaimAttachmentStruct): string | null => {
  if (attachment.hash.equals(Bytes.fromHexString(EMPTY_BYTES32))) return null;
  const ipfsHash = multihashStructToBase58(attachment.hash, attachment.size, attachment.hashFunction);
  return ipfsHash;
};

export const getIPFSHash_loanOffered = (attachment: LoanOfferedLoanOfferAttachmentStruct): string | null => {
  if (attachment.hash.equals(Bytes.fromHexString(EMPTY_BYTES32))) return null;
  const ipfsHash = multihashStructToBase58(attachment.hash, attachment.size, attachment.hashFunction);
  return ipfsHash;
};

export const getOrCreateUser = (address: Address): User => {
  let user = User.load(address.toHexString());
  if (!user) {
    user = new User(address.toHexString());
    user.address = address;
    user.claims = [];
    user.instantPayments = [];
    user.financeEvents = [];
    user.frendLendEvents = [];
    user.factoringEvents = [];
    user.swapEvents = [];
    user.invoiceEvents = [];
    user.save();
  }

  return user;
};

export const getOrCreateToken = (tokenAddress: Address): Token => {
  let token = Token.load(tokenAddress.toHexString());

  if (token === null) {
    token = new Token(tokenAddress.toHexString());
    token.address = tokenAddress;
    token.network = dataSource.network();

    // if the address is not 0 (what we consider a native token)
    if (!tokenAddress.equals(Address.fromHexString(ADDRESS_ZERO))) {
      const TokenContract = ERC20.bind(tokenAddress);
      token.decimals = TokenContract.decimals();
      token.symbol = TokenContract.symbol();
      token.isNative = false;
    } else {
      token.decimals = 18;
      token.symbol = "NATIVE";
      token.isNative = true;
    }

    token.save();
  }
  return token;
};

export const getOrCreateBullaManager = (event: ethereum.Event): BullaManager => {
  const address = event.address.toHexString();
  let bullaManager = BullaManager.load(address);

  if (bullaManager === null) {
    const bullaManagerContract = BullaManagerContract.bind(event.address);

    bullaManager = new BullaManager(address);
    bullaManager.address = event.address;
    bullaManager.description = bullaManagerContract.description().toString();
    bullaManager.lastUpdatedBlockNumber = event.block.number;
    bullaManager.lastUpdatedTimestamp = event.block.timestamp;
    bullaManager.save();
  }

  return bullaManager;
};

class FactoringContract {
  v0: BullaFactoringV0 | null;
  v1: BullaFactoringV1 | null;
  v2_1: BullaFactoringV2_1 | null;
  v2_2: BullaFactoringV2_2 | null;

  constructor(v0: BullaFactoringV0 | null, v1: BullaFactoringV1 | null, v2_1: BullaFactoringV2_1 | null, v2_2: BullaFactoringV2_2 | null) {
    this.v0 = v0;
    this.v1 = v1;
    this.v2_1 = v2_1;
    this.v2_2 = v2_2;
  }
}

function getFactoringContract(event: ethereum.Event, version: string): FactoringContract {
  if (version === "v0") {
    return new FactoringContract(BullaFactoringV0.bind(event.address), null, null, null);
  } else if (version === "v1") {
    return new FactoringContract(null, BullaFactoringV1.bind(event.address), null, null);
  } else if (version === "v2_1") {
    return new FactoringContract(null, null, BullaFactoringV2_1.bind(event.address), null);
  } else {
    return new FactoringContract(null, null, null, BullaFactoringV2_2.bind(event.address));
  }
}

export const getOrCreatePricePerShare = (event: ethereum.Event, version: string): FactoringPricePerShare => {
  let factoringPrice = FactoringPricePerShare.load(event.address.toHexString());
  const bullaFactoringContract = getFactoringContract(event, version);
  const currentPrice =
    version === "v0"
      ? bullaFactoringContract.v0!.pricePerShare()
      : version === "v1"
      ? bullaFactoringContract.v1!.pricePerShare()
      : version === "v2_1"
      ? bullaFactoringContract.v2_1!.pricePerShare()
      : version === "v2_2"
      ? bullaFactoringContract.v2_2!.pricePerShare()
      : BigInt.fromI32(0);

  if (!factoringPrice) {
    factoringPrice = new FactoringPricePerShare(event.address.toHexString());
    factoringPrice.address = event.address;
    factoringPrice.priceHistory = [];
  }

  const historyEntryId = factoringPrice.id.concat("-").concat(event.block.timestamp.toString());
  const historyEntry = new PriceHistoryEntry(historyEntryId);
  historyEntry.timestamp = event.block.timestamp;
  historyEntry.price = currentPrice;
  historyEntry.save();

  let updatedHistory = factoringPrice.priceHistory;
  updatedHistory.push(historyEntry.id);
  factoringPrice.priceHistory = updatedHistory;

  factoringPrice.save();

  return factoringPrice;
};

export const getLatestPrice = (event: ethereum.Event, version: string): BigInt => {
  const bullaFactoringContract = getFactoringContract(event, version);
  return version === "v0"
    ? bullaFactoringContract.v0!.pricePerShare()
    : version === "v1"
    ? bullaFactoringContract.v1!.pricePerShare()
    : version === "v2_1"
    ? bullaFactoringContract.v2_1!.pricePerShare()
    : bullaFactoringContract.v2_2!.pricePerShare();
};

export const getPriceBeforeTransaction = (event: ethereum.Event): BigInt => {
  const factoringPrice = FactoringPricePerShare.load(event.address.toHexString());
  if (!factoringPrice || factoringPrice.priceHistory.length === 0) {
    return BigInt.fromI32(1);
  }
  const lastHistoryEntry = PriceHistoryEntry.load(factoringPrice.priceHistory[factoringPrice.priceHistory.length - 1]);
  return lastHistoryEntry ? lastHistoryEntry.price : BigInt.fromI32(1);
};

class FundInfoResult {
  fundBalance: BigInt;
  deployedCapital: BigInt;
  capitalAccount: BigInt;

  constructor(fundBalance: BigInt, deployedCapital: BigInt, capitalAccount: BigInt) {
    this.fundBalance = fundBalance;
    this.deployedCapital = deployedCapital;
    this.capitalAccount = capitalAccount;
  }
}

export const getOrCreateHistoricalFactoringStatistics = (event: ethereum.Event, version: string): HistoricalFactoringStatistics => {
  let historicalFactoringStatistics = HistoricalFactoringStatistics.load(event.address.toHexString());
  const factoringContract = getFactoringContract(event, version);

  if (!historicalFactoringStatistics) {
    historicalFactoringStatistics = new HistoricalFactoringStatistics(event.address.toHexString());
    historicalFactoringStatistics.address = event.address;
    historicalFactoringStatistics.statistics = [];
  }

  let fundInfo: FundInfoResult;

  if (factoringContract.v0) {
    const v0FundInfo = factoringContract.v0!.try_getFundInfo();
    if (v0FundInfo.reverted) {
      return historicalFactoringStatistics;
    }
    fundInfo = new FundInfoResult(v0FundInfo.value.fundBalance, v0FundInfo.value.deployedCapital, v0FundInfo.value.capitalAccount);
  } else if (factoringContract.v1) {
    const v1FundInfo = factoringContract.v1!.try_getFundInfo();
    if (v1FundInfo.reverted) {
      return historicalFactoringStatistics;
    }
    fundInfo = new FundInfoResult(v1FundInfo.value.fundBalance, v1FundInfo.value.deployedCapital, v1FundInfo.value.capitalAccount);
  } else if (factoringContract.v2_1) {
    const v2_1FundInfo = factoringContract.v2_1!.try_getFundInfo();
    if (v2_1FundInfo.reverted) {
      return historicalFactoringStatistics;
    }
    fundInfo = new FundInfoResult(v2_1FundInfo.value.fundBalance, v2_1FundInfo.value.deployedCapital, v2_1FundInfo.value.capitalAccount);
  } else {
    const v2_2FundInfo = factoringContract.v2_2!.try_getFundInfo();
    if (v2_2FundInfo.reverted) {
      return historicalFactoringStatistics;
    }
    fundInfo = new FundInfoResult(v2_2FundInfo.value.fundBalance, v2_2FundInfo.value.deployedCapital, v2_2FundInfo.value.capitalAccount);
  }

  const historyEntryId = historicalFactoringStatistics.id.concat("-").concat(event.block.timestamp.toString());
  const historyEntry = new FactoringStatisticsEntry(historyEntryId);
  historyEntry.timestamp = event.block.timestamp;
  historyEntry.fundBalance = fundInfo.fundBalance;
  historyEntry.deployedCapital = fundInfo.deployedCapital;
  historyEntry.capitalAccount = fundInfo.capitalAccount;
  historyEntry.save();

  let updatedHistory = historicalFactoringStatistics.statistics;
  updatedHistory.push(historyEntry.id);
  historicalFactoringStatistics.statistics = updatedHistory;

  historicalFactoringStatistics.save();

  return historicalFactoringStatistics;
};

export const getOrCreatePoolProfitAndLoss = (event: ethereum.Event, pnl: BigInt): PoolPnl => {
  let poolPnl = PoolPnl.load(event.address.toHexString());

  if (!poolPnl) {
    poolPnl = new PoolPnl(event.address.toHexString());
    poolPnl.address = event.address;
    poolPnl.pnlHistory = [];
  }

  const pnlHistoryEntryId = poolPnl.id.concat("-").concat(event.transaction.hash.toHexString()).concat("-").concat(event.logIndex.toString());
  const pnlHistoryEntry = new PnlHistoryEntry(pnlHistoryEntryId);
  pnlHistoryEntry.timestamp = event.block.timestamp;
  pnlHistoryEntry.pnl = pnl;
  pnlHistoryEntry.save();

  let updatedHistory = poolPnl.pnlHistory;
  updatedHistory.push(pnlHistoryEntry.id);
  poolPnl.pnlHistory = updatedHistory;

  poolPnl.save();

  return poolPnl;
};

export const getApprovedInvoiceOriginalCreditor = (poolAddress: Address, version: string, invoiceId: BigInt): Address => {
  if (version == "v0") {
    return BullaFactoringV0.bind(poolAddress).approvedInvoices(invoiceId).getInvoiceSnapshot().creditor;
  } else if (version == "v1") {
    return BullaFactoringV1.bind(poolAddress).approvedInvoices(invoiceId).getInvoiceSnapshot().creditor;
  } else if (version == "v2_1") {
    return BullaFactoringV2_1.bind(poolAddress).approvedInvoices(invoiceId).getCreditor();
  } else {
    return BullaFactoringV2_2.bind(poolAddress).approvedInvoices(invoiceId).getCreditor();
  }
};

export const getApprovedInvoiceUpfrontBps = (poolAddress: Address, version: string, invoiceId: BigInt): i32 => {
  if (version == "v0") {
    return BullaFactoringV0.bind(poolAddress).approvedInvoices(invoiceId).getUpfrontBps();
  } else if (version == "v1") {
    return BullaFactoringV1.bind(poolAddress).approvedInvoices(invoiceId).getUpfrontBps();
  } else if (version == "v2_1") {
    return BullaFactoringV2_1.bind(poolAddress).approvedInvoices(invoiceId).getFeeParams().upfrontBps;
  } else {
    return BullaFactoringV2_2.bind(poolAddress).approvedInvoices(invoiceId).getFeeParams().upfrontBps;
  }
};

export const calculateTax = (poolAddress: Address, version: string, amount: BigInt): BigInt => {
  let taxBps: i32;
  if (version == "v0") {
    taxBps = BullaFactoringV0.bind(poolAddress).taxBps();
  } else if (version == "v1") {
    taxBps = BullaFactoringV1.bind(poolAddress).taxBps();
  } else {
    return BigInt.fromI32(0); // no tax in V2_1 / V2_2
  }

  const taxMbps = BigInt.fromI32(taxBps).times(BigInt.fromI32(1000));
  return amount.times(taxMbps).div(BigInt.fromI32(10_000_000));
};

// Helper function to perform multiplication and division with rounding up simulating the solidity mulDiv function
function mulDiv(x: BigInt, y: BigInt, denominator: BigInt, roundingUp: boolean = false): BigInt {
  const product = x.times(y);
  let result = product.div(denominator);

  if (roundingUp) {
    if (!product.mod(denominator).equals(BigInt.fromI32(0))) {
      result = result.plus(BigInt.fromI32(1));
    }
  }

  return result;
}

export const getTargetFeesAndTaxes = (poolAddress: Address, version: string, invoiceId: BigInt): BigInt[] => {
  let grossAmount: BigInt;
  let netAmount: BigInt;
  let adminFee: BigInt;
  let protocolFeeBps: BigInt;

  if (version == "v0") {
    const contract = BullaFactoringV0.bind(poolAddress);
    const approvedInvoice = contract.approvedInvoices(invoiceId);
    protocolFeeBps = BigInt.fromI32(contract.protocolFeeBps());
    grossAmount = approvedInvoice.getFundedAmountGross();
    netAmount = approvedInvoice.getFundedAmountNet();
    adminFee = approvedInvoice.getAdminFee();
  } else if (version == "v1") {
    const contract = BullaFactoringV1.bind(poolAddress);
    const approvedInvoice = contract.approvedInvoices(invoiceId);
    protocolFeeBps = BigInt.fromI32(contract.protocolFeeBps());
    grossAmount = approvedInvoice.getFundedAmountGross();
    netAmount = approvedInvoice.getFundedAmountNet();

    // Calculate days until due with ceiling rounding
    const daysInSeconds = BigInt.fromI32(24 * 3600);
    const targetDays = mulDiv(
      approvedInvoice.getInvoiceSnapshot().dueDate.minus(approvedInvoice.getFundedTimestamp()),
      BigInt.fromI32(1),
      daysInSeconds,
      true, // rounding up
    );

    // Use max of targetDays and minDaysInterestApplied
    const minDays = BigInt.fromI32(approvedInvoice.getMinDaysInterestApplied());
    const finalDays = targetDays.gt(minDays) ? targetDays : minDays;

    adminFee = mulDiv(
      mulDiv(approvedInvoice.getTrueFaceValue(), BigInt.fromI32(approvedInvoice.getAdminFeeBps()), BigInt.fromI32(10000)),
      finalDays,
      BigInt.fromI32(365),
    );
  } else if (version == "v2_1") {
    const contract = BullaFactoringV2_1.bind(poolAddress);
    const approvedInvoice = contract.approvedInvoices(invoiceId);
    // @notice arg upfrontBps = factorerUpfrontBps as it gets asigned in fundInvoice function
    const targetFees = contract.calculateTargetFees(invoiceId, approvedInvoice.getFeeParams().upfrontBps);
    adminFee = targetFees.getAdminFee();
    const targetInterest = targetFees.getTargetInterest();
    const targetSpreadAmount = targetFees.getTargetSpreadAmount();

    return [targetInterest, adminFee, targetSpreadAmount];
  } else {
    const contract = BullaFactoringV2_2.bind(poolAddress);
    const approvedInvoice = contract.approvedInvoices(invoiceId);
    const targetFees = contract.calculateTargetFees(invoiceId, approvedInvoice.getFeeParams().upfrontBps);
    adminFee = targetFees.getAdminFee();
    const targetInterest = targetFees.getTargetInterest();
    const targetSpreadAmount = targetFees.getTargetSpreadAmount();

    return [targetInterest, adminFee, targetSpreadAmount];
  }

  const targetFees = grossAmount.minus(netAmount);
  const protocolPlusGrossInterest = targetFees.minus(adminFee);

  // protocol fee with consistent rounding with solidity mulDiv
  const protocolFee = mulDiv(protocolPlusGrossInterest, protocolFeeBps, BigInt.fromI32(10000).plus(protocolFeeBps));

  const grossInterest = protocolPlusGrossInterest.minus(protocolFee);
  const tax = calculateTax(poolAddress, version, grossInterest);
  return [grossInterest, protocolFee, adminFee, tax];
};

// For compatibility with InvoiceReconciled for v0 fees
export const getTrueFeesAndTaxesV0 = (poolAddress: Address, invoiceId: BigInt): BigInt[] => {
  const targetFees = getTargetFeesAndTaxes(poolAddress, "v0", invoiceId);
  const adminFee = targetFees[2]; // in v0 realisedAdminFee = targetAdminFee
  const paidTax = BullaFactoringV0.bind(poolAddress).paidInvoiceTax(invoiceId);
  const trueNetInterest = BullaFactoringV0.bind(poolAddress).paidInvoicesGain(invoiceId);

  /* we can't assume no kickback for V0, because they can repay a 100% upfront invoice early and get some of the targetInterest back.
  So instead, let's do a rule of three:
  
  targetProtocolFee              trueProtocolFee
  ----------------------   =  ---------------------
  targetInterest (gross)       trueInterestNet + paidTax
  */
  const trueProcotolFee = targetFees[1] // targetProcotolFee
    .times(trueNetInterest.plus(paidTax))
    .div(targetFees[0]); // targetInterest

  return [trueNetInterest, trueProcotolFee, adminFee, paidTax];
};
