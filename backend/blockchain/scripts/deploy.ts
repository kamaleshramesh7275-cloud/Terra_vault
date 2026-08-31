import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("\n🚀 Deploying RecordRegistry to Polygon Amoy Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log(`📍 Deploying from address: ${deployer.address}`);

  let balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Current Balance: ${ethers.formatEther(balance)} MATIC`);

  let attempts = 0;
  const maxAttempts = 30; // 5 minutes max
  while (balance === 0n && attempts < maxAttempts) {
    attempts++;
    console.log(`⏳ [Attempt ${attempts}/${maxAttempts}] Waiting for test tokens to arrive (checking again in 10s)...`);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    balance = await ethers.provider.getBalance(deployer.address);
  }

  if (balance === 0n) {
    console.error("\n❌ Timeout: Wallet has no MATIC! Please ensure you requested tokens from the faucet to this address:");
    console.error(`👉 Address: ${deployer.address}`);
    process.exit(1);
  }

  console.log(`\n🎉 Test tokens arrived! Deployed Address Balance: ${ethers.formatEther(balance)} MATIC\n`);

  // Deploy
  const RecordRegistry = await ethers.getContractFactory("RecordRegistry");
  const registry = await RecordRegistry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log(`✅ RecordRegistry deployed at: ${contractAddress}`);
  console.log(`🔗 View on PolygonScan: https://amoy.polygonscan.com/address/${contractAddress}\n`);

  // Auto-update .env CONTRACT_ADDRESS
  const envPath = path.resolve(__dirname, "../../../.env");
  let envContent = fs.readFileSync(envPath, "utf-8");
  envContent = envContent.replace(
    /CONTRACT_ADDRESS=.*/,
    `CONTRACT_ADDRESS=${contractAddress}`
  );
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ CONTRACT_ADDRESS written to .env automatically\n`);

  // Save deployment info
  const deploymentInfo = {
    network:         "polygon-amoy",
    contractAddress: contractAddress,
    deployer:        deployer.address,
    deployedAt:      new Date().toISOString(),
    txHash:          registry.deploymentTransaction()?.hash,
  };
  fs.writeFileSync(
    path.resolve(__dirname, "../deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Deployment info saved to backend/blockchain/deployment.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
