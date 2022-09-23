import { network, ethers } from "hardhat"
import { GovernorContract } from "../typechain-types/contracts/Governance_Standard"
import * as fs from "fs"
import { developmentChains, VOTING_DELAY, VOTING_PERIOD } from "../helper-hardhat-config"
import { moveBlocks } from "../utils/moveBlocks"
/**
 * @notice Execute a script to cast a ote in a trsnscation
 * @notice This will be done after proposal
 */

const PROPOSAL_FILE_PATH = "proposals.json"
const castVote = async (voteType: number) => {
    const governorContract: GovernorContract = await ethers.getContract("GovernorContract")

    const chainId = (network.config.chainId || 31337).toString()

    const proposalsObj = JSON.parse(fs.readFileSync(PROPOSAL_FILE_PATH, "utf8"))

    const numProposals = proposalsObj[chainId].length
    const proposalId = proposalsObj[chainId][numProposals - 1]

    // 0 - against, 1- for in-favor, 2 abstain
    const castVoteTx = await governorContract.castVoteWithReason(
        proposalId,
        voteType,
        "I support collateral increase. Good"
    )

    const castVoteReceipt = await castVoteTx.wait(1)
    console.log("Voting completed")

    console.log(`current block number is ${await ethers.provider.getBlockNumber()}`)
    // once voting completed, move blocks by voting period to get to the result
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1)
        console.log(`Pushing blocks by ${VOTING_PERIOD + 1}`)
        console.log(`current block number is ${await ethers.provider.getBlockNumber()}`)
        console.log("Voting period has ended...")
    }

    // since deployer has all votes delegated, it constitutes a 100% quorum
    // so our proposal state should be succeesed (state of 4)
    // To check state go to https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/IGovernor.sol
    // Note that the 5'th item in list (index of 4) is succeeded

    const chkProposalStateTx = await governorContract.state(proposalId)
    console.log(`Proposal state is ${chkProposalStateTx}`)
}

const main = async () => {
    await castVote(1)
}

main()
    .then(() => {
        console.log("Voting completed")
        process.exit(0)
    })
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
