// script.js
async function connectWallet() {
  const connectBtn = document.getElementById("connect-wallet-button");
  const walletDisplay = document.getElementById("wallet-display");
  const authStatus = document.getElementById("auth-status");

  try {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask not found. Please install it and refresh the page.");
      authStatus.textContent = "MetaMask not detected ❌";
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // Save address locally so other pages (like Coffee Shop) can use it
    localStorage.setItem("walletAddress", address);

    walletDisplay.textContent = `Wallet: ${address}`;
    connectBtn.disabled = true;
    connectBtn.textContent = "Connected ✅";
    authStatus.textContent = "Authenticated ✅";

    console.log("Wallet connected:", address);
  } catch (err) {
    console.error("Wallet connection failed:", err);
    authStatus.textContent = "Connection failed ❌";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connect-wallet-button");
  if (connectBtn) {
    connectBtn.addEventListener("click", connectWallet);
  }

  // Auto-display wallet if already connected
  const walletAddress = localStorage.getItem("walletAddress");
  if (walletAddress) {
    const walletDisplay = document.getElementById("wallet-display");
    const authStatus = document.getElementById("auth-status");
    if (walletDisplay && authStatus) {
      walletDisplay.textContent = `Wallet: ${walletAddress}`;
      authStatus.textContent = "Authenticated ✅";
    }
  }
});

  const socket = io();

document.getElementById("send").addEventListener("click", () => {
  const msg = document.getElementById("message").value;
  if (msg.trim() !== "") {
    socket.emit("chat message", msg);
    document.getElementById("message").value = "";
  }
});

socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  li.textContent = msg;
  document.getElementById("messages").appendChild(li);
});
