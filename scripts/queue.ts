import { GovernorContract } from "../typechain-types/contracts/Governance_Standard"
import * as fs from "fs"
import { developmentChains, VOTING_DELAY, VOTING_PERIOD } from "../helper-hardhat-config"
import { moveBlocks } from "../utils/moveBlocks"
import { ethers, network, getNamedAccounts } from "hardhat"
import { LoansDAO } from "../typechain-types/contracts/LoansDAO"

const FUNCALL = "SetCollateralRatio"
const ARGS = [150]
const DESCRIPTION = "Proposal 5232# Update collateral ratio to 150 for all assets"
const PROPOSAL_FILE_PATH = "proposals.json"

/**
 * @notice Queue a proposal - once voting is done and quorum is passed
 * @notice We can queue a proposal for execution once the time window closes
 */

const queueProposal = async () => {
    const { deployer } = await getNamedAccounts()
    const governorContract: GovernorContract = await ethers.getContract("GovernorContract")
    const loansDAO: LoansDAO = await ethers.getContract("LoansDAO")

    const funcSignatureEncoded = loansDAO.interface.encodeFunctionData(FUNCALL, ARGS)
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(DESCRIPTION))
    const queueTx = await governorContract.queue(
        [loansDAO.address],
        [0],
        [funcSignatureEncoded],
        descriptionHash
    )

    await queueTx.wait(1)

    console.log("Proposal successfully queued for execution")
}

queueProposal()
    .then(() => {
        console.log("Proposal queued...")
        process.exit(0)
    })
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
