//SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * @notice 0KAGE is governance token that controls the voting of DAO
 * @notice based on number of votes polled in, DAO can change paramaters
 * @notice defined in the Governance.sol contract
 * @dev inheriting openzeppelin ERC20 contract and minting initial tokens in constructore
 */
contract ZeroKageToken is ERC20Votes {
    constructor(uint256 maxSupply) ERC20("ZeroKage", "0KAGE") ERC20Permit("ZeroKage") {
        // Mint initial tokens
        _mint(msg.sender, maxSupply);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal override(ERC20Votes) {
        super._mint(account, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20Votes) {
        super._burn(account, amount);
    }
}
