import { HardhatRuntimeEnvironment } from "hardhat/types"
import { NetworkConfig } from "hardhat/types"
import { verify } from "../utils/verify"
import { ethers } from "hardhat"
import { TimeLock } from "../typechain-types/contracts/Governance_Standard"
import { developmentChains, networkConfig, MIN_TIME_DELAY } from "../helper-hardhat-config"

const deployTimeLock = async (hre: HardhatRuntimeEnvironment) => {
    const { network, deployments, getNamedAccounts } = hre

    const { log, deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId || 31337

    log("Deploying Timelock contract....")
    log("----------------------------------")

    const timelock = await deploy("TimeLock", {
        from: deployer,
        log: true,
        args: [MIN_TIME_DELAY, [], []],
        waitConfirmations: networkConfig[chainId].blockConfirmations,
    })

    if (!developmentChains.includes(network.name)) {
        verify("TimeLock", [MIN_TIME_DELAY, [], []])
    }
    log("Deployed Timelock")

    // set ownership of ZeroKageToken to timelock contract
}

export default deployTimeLock

deployTimeLock.tags = ["all", "timelock"]
