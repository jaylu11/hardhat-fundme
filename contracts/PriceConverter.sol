//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPirce(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint) {
        //abi
        //address 0x694AA1769357215DE4FAC081bf1f309aDC325306
        // int price;
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0x694AA1769357215DE4FAC081bf1f309aDC325306
        // );
        (, int price, , , ) = priceFeed.latestRoundData();
        return uint(price * 1e10);
    }

    function getConversionRate(
        uint ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint) {
        uint ethPrice = getPirce(priceFeed);
        uint ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
