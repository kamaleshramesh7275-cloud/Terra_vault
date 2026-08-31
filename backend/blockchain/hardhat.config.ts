import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    // Local test network
    hardhat: {},
    // Polygon Amoy Testnet
    amoy: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com",
      chainId: 80002,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
  },
  paths: {
    sources:   "./contracts",
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
