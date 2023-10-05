// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

//error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint;

    uint public constant MINIMUM_USD = 50 * 1e18; //constant save gas cost

    address[] public s_funders;
    mapping(address => uint) s_addressToAmountFunded;
    address public immutable i_owner;

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "not enough"
        ); //1 eth
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    function getAddressToAmountFunded(
        address fundingAddress
    ) public view returns (uint) {
        return s_addressToAmountFunded[fundingAddress];
    }

    AggregatorV3Interface public s_priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function withdraw() public onlyOwner {
        //require(msg.sender == owner);
        for (
            uint funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        //funders = new address[](0);
        //payable(msg.sender).transfer(address(this).balance);

        (bool callSucess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSucess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for (
            uint funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    modifier onlyOwner() {
        require(msg.sender == i_owner);
        // if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }
}
