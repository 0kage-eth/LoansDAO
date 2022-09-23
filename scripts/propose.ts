import { GovernorContract, TimeLock } from "../typechain-types/contracts/Governance_Standard"
import { LoansDAO } from "../typechain-types/contracts/LoansDAO"
import { ethers, network } from "hardhat"
import { moveBlocks } from "../utils/moveBlocks"
import { developmentChains, VOTING_DELAY, VOTING_PERIOD } from "../helper-hardhat-config"
import * as fs from "fs"

const FUNCALL = "SetCollateralRatio"
const ARGS = [150]
const DESCRIPTION = "Proposal 5232# Update collateral ratio to 150 for all assets"
const PROPOSAL_FILE_PATH = "proposals.json"
/**
 * @notice Create a proposal to add a new token asset to protocol
 *
 */

const genericProposal = async (funcName: string, funcArgs: any[], description: string) => {
    const governorContract: GovernorContract = await ethers.getContract("GovernorContract")
    const loansDAOContract: LoansDAO = await ethers.getContract("LoansDAO")

    const encodeFunctionCall = loansDAOContract.interface.encodeFunctionData(funcName, funcArgs)
    console.log(`Function call encoded: ${encodeFunctionCall}`)

    const proposeTx = await governorContract.propose(
        [loansDAOContract.address],
        [0],
        [encodeFunctionCall],
        description
    )

    const proposalTx = await proposeTx.wait(1)
    const proposalId = proposalTx.events![0].args!.proposalId
    const chainId = (network.config.chainId || 31337).toString()

    console.log(`Proposal id is ${proposalId}`)

    console.log(`Current block number is ${await ethers.provider.getBlockNumber()}`)
    if (developmentChains.includes(network.name)) {
        // if on local chain, move blocks until voting period is over
        await moveBlocks(VOTING_DELAY + 1)
        console.log(
            `Block shifted by ${VOTING_DELAY + 1} to ${await ethers.provider.getBlockNumber()}`
        )
    }

    const proposalsObj = JSON.parse(fs.readFileSync(PROPOSAL_FILE_PATH, "utf8"))

    if (!proposalsObj[chainId].includes(proposalId.toString())) {
        proposalsObj[chainId].push(proposalId.toString())
    }
    fs.writeFileSync(PROPOSAL_FILE_PATH, JSON.stringify(proposalsObj))
}

genericProposal(FUNCALL, ARGS, DESCRIPTION)
    .then(() => {
        console.log("Proposal generated")
        process.exit(0)
    })
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
