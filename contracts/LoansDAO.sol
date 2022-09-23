//SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @notice LoansDAO contract controls key lending parameters of the protocol
 * @notice Lets say we have a fictitious protocol with key parameters
 * @notice collateral ratios, tokens that can be used as collateral
 * @notice only a governance vote can change these parameters - if its truly decentralized
 * @notice In this example, we setup a DAO where users can vote on changing LoanDAO parameters based on voting
 */

contract LoansDAO is Ownable {
    uint32 private collateralRatio; // value between 100-250
    bytes8[] private tickers;

    event CollateralChanged(uint32 newCollateral);

    event TickerAdded(bytes8 ticker);

    event TickerRemoved(bytes8 ticker);

    function SetCollateralRatio(uint32 collateral) public onlyOwner {
        require(collateral >= 100, "Collateral ratio cannot be less than 100");
        collateralRatio = collateral;

        emit CollateralChanged(collateral);
    }

    function AddTicker(bytes8 ticker) public onlyOwner {
        tickers.push(ticker);
        emit TickerAdded(ticker);
    }

    function RemoveTicker(bytes8 ticker) public onlyOwner {
        uint256 indx = IndexOf(tickers, ticker);
        require(indx < type(uint256).max, "Ticker not found");
        delete tickers[indx];
        emit TickerRemoved(ticker);
    }

    function getCollateralRatio() public view returns (uint32) {
        return collateralRatio;
    }

    function getTickers() public view returns (bytes8[] memory) {
        return tickers;
    }

    function IndexOf(bytes8[] memory inputArray, bytes8 input) public pure returns (uint256) {
        for (uint256 i = 0; i < inputArray.length; i++) {
            if (inputArray[i] == input) {
                return i;
            }
        }
        return type(uint256).max;
    }
}
