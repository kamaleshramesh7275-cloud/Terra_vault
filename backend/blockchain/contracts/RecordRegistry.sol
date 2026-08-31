// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RecordRegistry
 * @notice Terra_vault — tamper-evident land record hash registry on Polygon.
 *         Only SHA3-256 hashes are stored on-chain. Raw data stays off-chain.
 *         Any post-verification tampering is instantly detectable.
 */
contract RecordRegistry {

    struct Anchor {
        bytes32 recordHash;   // SHA3-256(fields + doc_hash + verifier + timestamp)
        address verifier;     // wallet address of the verifying officer
        uint256 timestamp;    // block.timestamp at anchoring
    }

    // recordId (UUID string) → ordered list of anchors (most recent last)
    mapping(string => Anchor[]) private _anchors;

    // ── Events ────────────────────────────────────────────────────────────────
    event RecordAnchored(
        string  indexed recordId,
        bytes32         hash,
        address indexed verifier,
        uint256         timestamp
    );

    // ── Write ─────────────────────────────────────────────────────────────────
    /**
     * @notice Anchor a verified record hash.
     * @param recordId  UUID of the land record (from Terra_vault DB)
     * @param hash      SHA3-256 digest of (fields JSON + doc SHA256 + verifier ID + ISO timestamp)
     */
    function anchorRecord(string calldata recordId, bytes32 hash) external {
        require(bytes(recordId).length > 0, "recordId cannot be empty");
        require(hash != bytes32(0),         "hash cannot be zero");

        _anchors[recordId].push(Anchor({
            recordHash: hash,
            verifier:   msg.sender,
            timestamp:  block.timestamp
        }));

        emit RecordAnchored(recordId, hash, msg.sender, block.timestamp);
    }

    // ── Read ──────────────────────────────────────────────────────────────────
    /**
     * @notice Returns the most recently anchored hash for a record.
     */
    function getLatestAnchor(string calldata recordId)
        external view
        returns (bytes32 recordHash, address verifier, uint256 timestamp)
    {
        Anchor[] storage anchors = _anchors[recordId];
        require(anchors.length > 0, "Record not anchored");
        Anchor storage latest = anchors[anchors.length - 1];
        return (latest.recordHash, latest.verifier, latest.timestamp);
    }

    /**
     * @notice Returns full anchor history for a record (chain-of-title audit trail).
     */
    function getHistory(string calldata recordId)
        external view
        returns (Anchor[] memory)
    {
        return _anchors[recordId];
    }

    /**
     * @notice Returns the total number of times a record has been anchored.
     */
    function getAnchorCount(string calldata recordId)
        external view
        returns (uint256)
    {
        return _anchors[recordId].length;
    }
}
