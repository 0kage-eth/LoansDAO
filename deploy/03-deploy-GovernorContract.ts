import { ethers, getNamedAccounts, deployments, network } from "hardhat"
import {
    developmentChains,
    networkConfig,
    VOTING_DELAY,
    VOTING_PERIOD,
    GOVERNANCE_QUORUM,
} from "../helper-hardhat-config"
import { verify } from "../utils/verify"

const deployGovernorContract = async () => {
    const { deployer } = await getNamedAccounts()

    const { deploy, log } = deployments
    const chainId = network.config.chainId || 31337

    const zeroKageToken = await ethers.getContract("ZeroKageToken")
    const timelockController = await ethers.getContract("TimeLock")

    const args = [
        zeroKageToken.address,
        timelockController.address,
        GOVERNANCE_QUORUM,
        VOTING_PERIOD,
        VOTING_DELAY,
    ]
    log("Deploying governor contract...")
    log("----------------------------------")

    const tx = await deploy("GovernorContract", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: networkConfig[chainId].blockConfirmations,
    })

    log("Governor contract deployed")

    if (!developmentChains.includes(network.name)) {
        verify("GovernorContract", args)
    }
}

export default deployGovernorContract

deployGovernorContract.tags = ["all", "governor"]
