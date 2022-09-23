import { HardhatRuntimeEnvironment } from "hardhat/types"
import { ethers } from "hardhat"
import { developmentChains, networkConfig, ADDRESS_ZERO } from "../helper-hardhat-config"

const setupGovernance = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network } = hre

    const { deployer } = await getNamedAccounts()

    const { log, deploy } = deployments

    log("Setting up governance rules...")

    const timeLockContract = await ethers.getContract("TimeLock")
    const governorContract = await ethers.getContract("GovernorContract")

    // Get PROPOSER, EXECUTOR and ADMIN role ids from Timelock contract

    const proposerRoleId = await timeLockContract.PROPOSER_ROLE()
    const executorRoleId = await timeLockContract.EXECUTOR_ROLE()
    const adminRoleId = await timeLockContract.TIMELOCK_ADMIN_ROLE()

    // Next grant proposer role to governor contract - only governor can propose
    const proposerTx = await timeLockContract.grantRole(proposerRoleId, governorContract.address)
    await proposerTx.wait(1)

    // Grant executor role to anyone - anyone can act as an executor
    // Nobody gets the role - so anyone can execute
    const executorTx = await timeLockContract.grantRole(executorRoleId, ADDRESS_ZERO)
    await executorTx.wait(1)

    // Revoke admin role from deployer - if its truly decentralized, nobody should have ownership rights on governance exeuction
    const revokeTx = await timeLockContract.revokeRole(adminRoleId, deployer)
    await revokeTx.wait(1)
}

export default setupGovernance
setupGovernance.tags = ["all", "setupGovControls"]
