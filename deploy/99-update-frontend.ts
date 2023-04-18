import fs from "fs"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import path from "path"

const FRONTEND_END_ADDRESSES_FILE = path.resolve(
    __dirname,
    "..",
    "frontend",
    "constants",
    "contractAddresses.json"
)

const FRONTEND_END_ABI_FILE = path.resolve(__dirname, "..", "frontend", "constants", "abi.json")

const updateUI: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { network, ethers } = hre
    const chainId = network.config.chainId?.toString()!

    if (process.env.UPDATE_FRONTEND) {
        console.log("Writing to front end...")
        const raffle = await ethers.getContract("Raffle")

        let contractAddresses
        try {
            const parsedData = JSON.parse(fs.readFileSync(FRONTEND_END_ADDRESSES_FILE, "utf8"))
            contractAddresses =
                typeof parsedData === "object" && !Array.isArray(parsedData) ? parsedData : {}
        } catch (error) {
            contractAddresses = {}
        }

        if (contractAddresses && chainId in contractAddresses) {
            if (!contractAddresses[chainId].includes(raffle.address)) {
                contractAddresses[chainId].push(raffle.address)
            }
        } else {
            contractAddresses[chainId] = [raffle.address]
        }

        fs.writeFileSync(FRONTEND_END_ADDRESSES_FILE, JSON.stringify(contractAddresses))
        const formattedData = raffle.interface.format(ethers.utils.FormatTypes.json)

        !Array.isArray(formattedData) && fs.writeFileSync(FRONTEND_END_ABI_FILE, formattedData)

        console.log("Front end written!")
    }
}

export default updateUI
updateUI.tags = ["all", "frontend"]
