import { Address, Bytes, dataSource, ethereum } from "@graphprotocol/graph-ts";
import { encode } from "as-base58/assembly/index";
import { ClaimCreatedClaimAttachmentStruct } from "../../generated/BullaClaimERC721/BullaClaimERC721";
import { ERC20 } from "../../generated/BullaClaimERC721/ERC20";
import { BullaManager as BullaManagerContract } from "../../generated/BullaManager/BullaManager";
import { LoanOfferedLoanOfferAttachmentStruct } from "../../generated/FrendLend/FrendLend";
import { BullaManager, Token, User, FactoringPricePerShare, PriceHistoryEntry, HistoricalFactoringStatistics, FactoringStatisticsEntry } from "../../generated/schema";
import { BullaFactoring, DepositMadeWithAttachmentAttachmentStruct, SharesRedeemedWithAttachmentAttachmentStruct } from "../../generated/BullaFactoring/BullaFactoring";
import { BigInt } from "@graphprotocol/graph-ts";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const EMPTY_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const CLAIM_TYPE_INVOICE = "Invoice";
export const CLAIM_TYPE_PAYMENT = "Payment";

export const CLAIM_STATUS_PENDING = "Pending";
export const CLAIM_STATUS_REJECTED = "Rejected";
export const CLAIM_STATUS_RESCINDED = "Rescinded";
export const CLAIM_STATUS_REPAYING = "Repaying";
export const CLAIM_STATUS_PAID = "Paid";

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
      stringArray[i] = lowercaseHexChars[capitalCharIndex];
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

export const getIPFSHash_depositWithAttachment = (attachment: DepositMadeWithAttachmentAttachmentStruct): string | null => {
  if (attachment.hash.equals(Bytes.fromHexString(EMPTY_BYTES32))) return null;
  const ipfsHash = multihashStructToBase58(attachment.hash, attachment.size, attachment.hashFunction);
  return ipfsHash;
};

export const getIPFSHash_redeemWithAttachment = (attachment: SharesRedeemedWithAttachmentAttachmentStruct): string | null => {
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

export const getOrCreatePricePerShare = (event: ethereum.Event): FactoringPricePerShare => {
  let factoringPrice = FactoringPricePerShare.load(event.address.toHexString());
  const bullaFactoringContract = BullaFactoring.bind(event.address);
  const currentPrice = bullaFactoringContract.pricePerShare();

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

export const getLatestPrice = (event: ethereum.Event): BigInt => {
  const bullaFactoringContract = BullaFactoring.bind(event.address);
  return bullaFactoringContract.pricePerShare();
};

export const getOrCreateHistoricalFactoringStatistics = (event: ethereum.Event): HistoricalFactoringStatistics => {
  let historicalFactoringStatistics = HistoricalFactoringStatistics.load(event.address.toHexString());
  const bullaFactoringContract = BullaFactoring.bind(event.address);
  const fundInfo = bullaFactoringContract.getFundInfo();

  if (!historicalFactoringStatistics) {
    historicalFactoringStatistics = new HistoricalFactoringStatistics(event.address.toHexString());
    historicalFactoringStatistics.address = event.address;
    historicalFactoringStatistics.statistics = [];
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
