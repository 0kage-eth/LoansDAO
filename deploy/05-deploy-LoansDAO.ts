import { HardhatRuntimeEnvironment } from "hardhat/types"
import { networkConfig } from "../helper-hardhat-config"

const deployLoansDAO = async (hre: HardhatRuntimeEnvironment) => {
    const { network, ethers, getNamedAccounts, deployments } = hre

    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId || 31337

    const { deploy, log } = deployments

    log("Deploying Loans DAO")
    log("-------------------------")
    const args: any = []
    const deployTx = await deploy("LoansDAO", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: networkConfig[chainId].blockConfirmations,
    })

    log(`Loans DAO contract deployed at ${deployTx.address}`)
    log("-------------------------")

    const timeLockContract = await ethers.getContract("TimeLock")
    log(
        `Transferring ownership of Loans DAO contract to Timelock contract at ${timeLockContract.address}`
    )

    const loansDAO = await ethers.getContract("LoansDAO")

    const transferOwnershipTx = await loansDAO.transferOwnership(timeLockContract.address)
    await transferOwnershipTx.wait(1)

    log("Ownership successfully transferred")
    log(`New ownwer of loansDAO is ${await loansDAO.owner()}`)
}
export default deployLoansDAO
deployLoansDAO.tags = ["all", "loansDAO"]
