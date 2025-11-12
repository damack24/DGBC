// client.js

const FAMILY_CONTRACT_ADDRESS = "0x3f8dE7a204d8e5e3C912319a6C86fC4A476e33Fa";
const TOKEN_IDS = [1, 2, 3, 4, 5, 6];
const CHAIN_ID = 137; // Polygon Mainnet

let provider;
let signer;
let userAddress;

// Elements
const connectBtn = document.getElementById("connect-wallet-button");
const walletStatus = document.getElementById("wallet-status");
const gameRoomSection = document.getElementById("game-room-section");
const donForm = document.getElementById("don-form");
const donQuery = document.getElementById("don-query");
const donResponse = document.getElementById("don-response");
const donLoading = document.getElementById("don-loading");

// 1️⃣ Connect Wallet via Metamask
connectBtn.addEventListener("click", async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      walletStatus.innerHTML = `<p class="text-sm text-green-400">Connected: ${userAddress.substring(0,6)}...${userAddress.slice(-4)}</p>`;
      
      // Check NFT Ownership
      checkNFTOwnership();
    } catch (err) {
      console.error(err);
      walletStatus.innerHTML = `<p class="text-sm text-red-500">Connection Failed</p>`;
    }
  } else {
    alert("Please install Metamask!");
  }
});

// 2️⃣ Check NFT ownership
async function checkNFTOwnership() {
  const contract = new ethers.Contract(FAMILY_CONTRACT_ADDRESS, [
    "function balanceOf(address owner, uint256 id) view returns (uint256)"
  ], provider);

  let ownsNFT = false;
  for (const tokenId of TOKEN_IDS) {
    const balance = await contract.balanceOf(userAddress, tokenId);
    if (balance > 0) {
      ownsNFT = true;
      break;
    }
  }

  if (ownsNFT) {
    gameRoomSection.classList.remove("hidden");
    alert("NFT verified! Game Room unlocked.");
  } else {
    alert("No valid NFT found. Access denied.");
  }
}

// 3️⃣ Talk to The Don (send query to server)
donForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = donQuery.value.trim();
  if (!query) return;

  donLoading.classList.remove("hidden");
  donResponse.classList.add("hidden");

  try {
    const res = await fetch("/api/don-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const data = await res.json();

    donLoading.classList.add("hidden");
    donResponse.classList.remove("hidden");
    donResponse.innerText = data.response || "The Don remains silent.";
  } catch (err) {
    console.error(err);
    donLoading.classList.add("hidden");
    donResponse.classList.remove("hidden");
    donResponse.innerText = "Failed to get a response. The Don requires discretion.";
  }
});
