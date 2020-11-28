const VAT = artifacts.require('Vat')
const SPOT = artifacts.require('Spotter')
const MEDIAN = artifacts.require('Median')
const OSM = artifacts.require('OSM')

const medianWriters = ["0x5FB72DCe5D36a2551a3444e12ddD623D0F57E03b"]

const Web3 = require('web3')
let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

const ilk = web3.utils.keccak256("ETH")

module.exports = async function(_deployer) {
  // Use deployer to state migration tasks.
  await _deployer.deploy(VAT)
  let vatInstance = await VAT.deployed()
  await vatInstance.init(ilk)

  await _deployer.deploy(SPOT, VAT.address)

  //deploy MEDIAN
  await _deployer.deploy(MEDIAN)
  let medianInstance = await MEDIAN.deployed()
  
  //Whitelist an address, that can update the price
  await medianInstance.lift(medianWriters)

  //deploy OSM
  await _deployer.deploy(OSM,MEDIAN.address)

  //whitelist address of OSM, so that it can read the price
  await medianInstance.kiss(OSM.address)

  //Update address of OSM to spotter for this ilk
  let spotterInstance = await SPOT.deployed()
  //let pip = '0x7069700000000000000000000000000000000000000000000000000000000000'//web3.utils.asciiToHex('pip')
  pip = web3.utils.asciiToHex('pip')
  await spotterInstance.file(ilk, pip, OSM.address)
  
};
