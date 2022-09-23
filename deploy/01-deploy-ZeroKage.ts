import { HardhatRuntimeEnvironment } from "hardhat/types"
import { ethers } from "hardhat"
import { NetworkConfig } from "hardhat/types"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import { verify } from "../utils/verify"
import { ZeroKageToken } from "../typechain-types/contracts/ZeroKageToken"
import { ERC20Votes } from "../typechain-types/@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes"

/**
 * @notice this function deploys ZeroKage token that decides voting power in governance
 * @notice on creation, ZeroKage token contract mints 1000 0KAGE tokens and sends to deployer
 * @notice Since this is a ERC20Votes contract, we need to delegate these tokens so that they can be used for voting
 * @param hre hardhat network
 */
const deployZeroKageToken = async (hre: HardhatRuntimeEnvironment) => {
    const { network, deployments, getNamedAccounts } = hre

    const { deployer } = await getNamedAccounts()
    const { log, deploy } = deployments

    log("Deploying Zero Kage token...")
    log("----------------------------")

    const chainId = network.config.chainId || 31337

    const deployTx = await deploy("ZeroKageToken", {
        from: deployer,
        log: true,
        waitConfirmations: networkConfig[chainId].blockConfirmations,
        args: [ethers.utils.parseEther("1000")],
    })

    if (!developmentChains.includes(network.name)) {
        log("Non local network detected.. verifying contract")

        verify("ZeroKageToken", [ethers.utils.parseEther("1000")])
    }

    log(`Zero Kage token deployed successfully to ${deployTx.address}`)

    log(`Delegating all tokens to deployer`)

    await delegateTokens(deployTx.address, deployer)
    log("Delegated....")
}

const delegateTokens = async (governanceTokenAddress: string, delegatorAddress: string) => {
    const govTokenContract: ERC20Votes = await ethers.getContractAt(
        "ZeroKageToken",
        governanceTokenAddress
    )

    const delegateTx = await govTokenContract.delegate(delegatorAddress)
    await delegateTx.wait(1)

    console.log(
        `Num checkpoints for delegator Address is ${await govTokenContract.numCheckpoints(
            delegatorAddress
        )}`
    )
}

export default deployZeroKageToken
deployZeroKageToken.tags = ["all", "zerokage"]
