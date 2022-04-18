const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
  },
  type: {
    type: String,
    enum: ["Debit", "Credit"],
  },
  amount: {
    type: Number,
  },
  reason: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now(),
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: "Store",
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
  },
  currency: {
    type: String,
  },
  wallet: {
    type: String,
  },
  bank: {
    type: String,
  },
  method: {
    type: String,
  },
  international: {
    type: String,
  },
  invoice_id: {
    type: String,
  },
  card_id: {
    type: String,
  },
  notes: {
    type: Map,
  },
  fee: {
    type: Number,
  },
  tax: {
    type: Number,
  },
});

walletTransactionSchema.index({
  transactionId: "text",
  type: "text",
  reason: "text",
  status: "text",
  invoice_id: "text",
  method: "text",
});

const WalletTransaction = new mongoose.model(
  "WalletTransaction",
  walletTransactionSchema
);
module.exports = WalletTransaction;
