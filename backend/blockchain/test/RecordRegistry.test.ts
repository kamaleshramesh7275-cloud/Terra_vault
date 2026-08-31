import { expect } from "chai";
import { ethers } from "hardhat";

describe("RecordRegistry", function () {
  let registry: any;
  let owner: any;
  let other: any;

  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();
    const RecordRegistry = await ethers.getContractFactory("RecordRegistry");
    registry = await RecordRegistry.deploy();
  });

  it("anchors a record and retrieves it", async () => {
    const recordId = "test-record-001";
    const hash = ethers.keccak256(ethers.toUtf8Bytes("test-data"));

    await registry.anchorRecord(recordId, hash);
    const [storedHash, verifier, timestamp] = await registry.getLatestAnchor(recordId);

    expect(storedHash).to.equal(hash);
    expect(verifier).to.equal(owner.address);
    expect(timestamp).to.be.gt(0);
  });

  it("detects tampered data (different hash)", async () => {
    const recordId = "test-record-002";
    const originalHash = ethers.keccak256(ethers.toUtf8Bytes("original-data"));
    const tamperedHash = ethers.keccak256(ethers.toUtf8Bytes("tampered-data"));

    await registry.anchorRecord(recordId, originalHash);
    const [storedHash] = await registry.getLatestAnchor(recordId);

    expect(storedHash).to.equal(originalHash);
    expect(storedHash).to.not.equal(tamperedHash);
  });

  it("stores full anchor history", async () => {
    const recordId = "test-record-003";
    const hash1 = ethers.keccak256(ethers.toUtf8Bytes("v1"));
    const hash2 = ethers.keccak256(ethers.toUtf8Bytes("v2"));

    await registry.anchorRecord(recordId, hash1);
    await registry.anchorRecord(recordId, hash2);

    const history = await registry.getHistory(recordId);
    expect(history.length).to.equal(2);
    expect(history[0].recordHash).to.equal(hash1);
    expect(history[1].recordHash).to.equal(hash2);
  });

  it("reverts on empty recordId", async () => {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("data"));
    await expect(registry.anchorRecord("", hash)).to.be.revertedWith("recordId cannot be empty");
  });

  it("reverts on zero hash", async () => {
    await expect(registry.anchorRecord("test-record-004", ethers.ZeroHash))
      .to.be.revertedWith("hash cannot be zero");
  });
});
