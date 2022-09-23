import { GovernorContract } from "../typechain-types/contracts/Governance_Standard"
import * as fs from "fs"
import {
    developmentChains,
    VOTING_DELAY,
    VOTING_PERIOD,
    MIN_TIME_DELAY,
} from "../helper-hardhat-config"
import { ethers, network, getNamedAccounts } from "hardhat"
import { LoansDAO } from "../typechain-types/contracts/LoansDAO"
import { shiftTime } from "../utils/shiftTime"

const FUNCALL = "SetCollateralRatio"
const ARGS = [150]
const DESCRIPTION = "Proposal 5232# Update collateral ratio to 150 for all assets"
const PROPOSAL_FILE_PATH = "proposals.json"

const executeProposal = async () => {
    const { deployer } = await getNamedAccounts()
    const governorContract: GovernorContract = await ethers.getContract(
        "GovernorContract",
        deployer
    )

    const loansDAO: LoansDAO = await ethers.getContract("LoansDAO")

    // push time to open the timelock
    // note that we used 3600 seconds as min time delay
    // so we have to push time ahead by 3600 seconds programatically
    // can only be done for local network
    if (developmentChains.includes(network.name)) {
        await shiftTime(MIN_TIME_DELAY)
    }

    const funcSignature = loansDAO.interface.encodeFunctionData(FUNCALL, ARGS)
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(DESCRIPTION))
    // Now anyone can execute the proposal
    const executeTx = await governorContract.execute(
        [loansDAO.address],
        [0],
        [funcSignature],
        descriptionHash
    )

    await executeTx.wait(1)

    console.log("Transaction execution completed")
    console.log("Checking updated value of collateral ratio - should be equal to 150")

    const updatedCollateral = await loansDAO.getCollateralRatio()

    console.log(`Collateral value ${updatedCollateral}`)
}

executeProposal()
    .then(() => {
        console.log("Execution completed")
        process.exit(0)
    })
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
