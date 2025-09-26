const { ethers } = require("ethers");
require("dotenv").config();
const { abi: TouristID_ABI } = require("../TouristID_ABI.json");

const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.TOURISTID_CONTRACT_ADDRESS,
  TouristID_ABI,
  signer
);

module.exports = { provider, signer, contract };
