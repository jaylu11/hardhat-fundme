//import
// function deployFunc() {
//   console.log("hi");
// }
// module.exports.default = deployFunc();

const { network, hardhatArguments } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
require("dotenv").config();
const { verify } = require("../utils/verify");
module.exports = async ({ getNamedAccounts, deployments }) => {
  //const { getNamedAccounts, deployments } = hre;

  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  //const args = [ethUsdPriceFeedAddress];
  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress], //put pricefeed address
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    //verify
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }
  log("--------------------------------");
};
module.exports.tags = ["all", "fundme"];
