document.getElementById('enter-btn').addEventListener('click', () => {
  alert('Welcome to the Family. Stay loyal.');
});

async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    alert('MetaMask not detected! Please install it first.');
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const address = accounts[0];

    document.getElementById('wallet-address').innerText = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
    document.getElementById('connect-btn').innerText = 'Wallet Connected ✅';
    document.getElementById('connect-btn').disabled = true;

    console.log('Wallet connected:', address);

  } catch (err) {
    console.error(err);
    alert('Failed to connect wallet. Please try again.');
  }
}

document.getElementById('connect-btn').addEventListener('click', connectWallet);
