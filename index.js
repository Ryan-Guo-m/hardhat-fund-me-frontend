// 在 nodejs，用 require() 引入
// 在 前端JavaScript，可以用 require，但用 import 更好
import { ethers } from "./ethers-5.1.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log(ethers)

async function connect() {
    if (typeof window.ethereum !== undefined) {
        try {
            await window.ethereum.request({
                method: "eth_requestAccounts",
            })
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "Connected!"
    } else {
        connectButton.innerHTML = "Please install Metamask!"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

// fund function
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== undefined) {
        // 需要provider：连接到blockchain
        // 需要signer：钱包
        // 需要contract：交互对象
        // ^ ABI & Address
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // signer 就是前端界面连接到的那个Metamask账号地址
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // Listen for the tx to be mined
            // 或者说 listen for an event <- We haven't learned about yet!
            // await 等待事情发生，该函数要返回一个Promise
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.error(error)
        }
    }
}

// 不是一个async函数
function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    /**
     * 返回Promise是为了给区块链创建一个监听器，同时告诉JavaScript等待该事件发生。
     * resolve是一个函数，当成功时执行；reject是一个函数，当失败时执行。
     */
    return new Promise((resolve, reject) => {
        // listen this transaction to finish. ()=>{}是listener函数。
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

// withdraw function
async function withdraw() {
    if (typeof window.ethereum !== undefined) {
        console.log("Withdraw...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
