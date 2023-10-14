const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
describe("FundMe", async () => {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.parseEther("1");
  beforeEach(async () => {
    //deploy fundMe contract
    //using hardhat-deploy
    // const accounts = await ethers.getSigners();
    // const accountZero = accounts[0];
    deployer = (await getNamedAccounts()).deployer;
    const contracts = await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    //fundMe = contracts["FundMe"];
    mockV3Aggregator = contracts["MockV3Aggregator"];
  });

  describe("constructor", async () => {
    it("set the aggregator addresses correctly", async () => {
      const response = await fundMe.getPriceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });
  describe("fund", async function () {
    it("fails if you don't send enough", async () => {
      await expect(fundMe.fund()).to.be.reverted;
    });
    it("updated the amount funded data structure", async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.getAddressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });
    it("adds s_funders to array of s_funders", async () => {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.s_funders(0);
      assert.equal(funder, deployer);
    });
  });
  describe("withdaw", async () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });
    it("withdraw ETH from a single founder", async () => {
      //Arrange
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.getAddress()
      );
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );
      //act
      const transactionResponse = await fundMe.withdraw();
      const transactionReciept = await transactionResponse.wait(1);
      const { gasUsed, gasPrice } = transactionReciept;
      const gasCost = gasUsed * BigInt(gasPrice);
      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.getAddress()
      );
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);
      //assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        (startingFundMeBalance + startingDeployerBalance).toString(),
        (endingDeployerBalance + gasCost).toString()
      );
    });
    it("withdraw with multiple s_funders", async () => {
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.getAddress()
      );
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );
      //act
      const transactionResponse = await fundMe.withdraw();
      const transactionReciept = await transactionResponse.wait(1);
      const { gasUsed, gasPrice } = transactionReciept;
      const gasCost = gasUsed * BigInt(gasPrice);
      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.getAddress()
      );
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);
      //assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        (startingFundMeBalance + startingDeployerBalance).toString(),
        (endingDeployerBalance + gasCost).toString()
      );
      //console.log(fundMe.s_funders(0));
      await expect(fundMe.s_funders(0)).to.be.reverted;
      for (i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.getAddressToAmountFunded(accounts[i].address),
          0
        );
      }
    });
    it("only owner", async () => {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnected = await fundMe.connect(attacker);
      await expect(attackerConnected.withdraw()).to.be.reverted;
    });
    it("cheaperwithdraw with multiple s_funders", async () => {
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.getAddress()
      );
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );
      //act
      const transactionResponse = await fundMe.cheaperWithdraw();
      const transactionReciept = await transactionResponse.wait(1);
      const { gasUsed, gasPrice } = transactionReciept;
      const gasCost = gasUsed * BigInt(gasPrice);
      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.getAddress()
      );
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);
      //assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        (startingFundMeBalance + startingDeployerBalance).toString(),
        (endingDeployerBalance + gasCost).toString()
      );
      //console.log(fundMe.s_funders(0));
      await expect(fundMe.s_funders(0)).to.be.reverted;
      for (i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.getAddressToAmountFunded(accounts[i].address),
          0
        );
      }
    });
  });
});
