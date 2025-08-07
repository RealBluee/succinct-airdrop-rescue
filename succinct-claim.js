// succinct-claim.js

require("dotenv").config();
const ethers = require("ethers");
const { FlashbotsBundleProvider } = require("@flashbots/ethers-provider-bundle");
const axios = require("axios");

// === CONFIG ===
const COMPROMISED_KEY = process.env.COMPROMISED_KEY;
const SPONSOR_KEY = process.env.SPONSOR_KEY;
const NEW_WALLET_ADDRESS = process.env.NEW_WALLET_ADDRESS;

const ALCHEMY_URL = process.env.ALCHEMY_URL;
const INFURA_URL = process.env.INFURA_URL;

const AIRDROP_CONTRACT = "0x16ec6dAdfE11e523c47CB8878b85606c0ca5cF95";
const TOKEN_CONTRACT = "0x6BEF15D938d4E72056AC92Ea4bDD0D76B1C4ad29";

const AIRDROP_ABI = [
  "function claim(uint256 index, address account, uint256 amount, bytes32[] merkleProof)",
];

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
];

// === RPC FALLBACK ===
async function getFallbackProvider() {
  const urls = [ALCHEMY_URL, INFURA_URL];
  for (const url of urls) {
    try {
      const provider = new ethers.JsonRpcProvider(url);
      await provider.getBlockNumber();
      console.log(`✅ Connected to RPC: ${url}`);
      return provider;
    } catch {
      console.warn(`⚠️ RPC failed: ${url}`);
    }
  }
  throw new Error("❌ No working RPC URLs.");
}

// === MAIN FUNCTION ===
async function main() {
  const provider = await getFallbackProvider();

  const compromisedWallet = new ethers.Wallet(COMPROMISED_KEY, provider);
  const sponsorWallet = new ethers.Wallet(SPONSOR_KEY, provider);

  // === STEP 1: Request Nonce ===
  console.log("🔑 Requesting nonce...");
  const nonceRes = await axios.get("https://claim.succinct.foundation/api/auth/nonce");
  const authNonce = nonceRes.data.nonce;

  // === STEP 2: Create SIWE Message ===
  const now = new Date();
  const exp = new Date(now.getTime() + 5 * 60 * 1000); // 5 min expiration
  const siweMsg = `claim.succinct.foundation wants you to sign in with your Ethereum account:\n${compromisedWallet.address}\n\nSign in with Ethereum to the claim site.\n\nURI: https://claim.succinct.foundation\nVersion: 1\nChain ID: 1\nNonce: ${authNonce}\nIssued At: ${now.toISOString()}\nExpiration Time: ${exp.toISOString()}`;

  const signature = await compromisedWallet.signMessage(siweMsg);

  // === STEP 3: Auth Verify ===
  console.log("🔐 Verifying signature...");
  const verifyRes = await axios.post("https://claim.succinct.foundation/api/auth/verify", {
    message: siweMsg,
    signature,
  });
  const authToken = verifyRes.data.token;
  console.log("✅ Token obtained");

  // === STEP 4: Fetch Claim Info ===
  console.log("📦 Fetching claim info...");
  const infoRes = await axios.get("https://claim.succinct.foundation/api/claim/info", {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const { idx, amount, proof } = infoRes.data;
  console.log("✅ Claim data:", { idx, amount, proof });

  // === STEP 5: Prepare Flashbots Bundle ===
  const airdrop = new ethers.Contract(AIRDROP_CONTRACT, AIRDROP_ABI, compromisedWallet);
  const tokenContract = new ethers.Contract(TOKEN_CONTRACT, ERC20_ABI, compromisedWallet);

  const nonce = await provider.getTransactionCount(compromisedWallet.address);

  const txClaim = await airdrop.claim.populateTransaction(
    idx,
    compromisedWallet.address,
    amount,
    proof
  );

  const txTransfer = await tokenContract.transfer.populateTransaction(NEW_WALLET_ADDRESS, amount);

  // Simulate to make sure claim is valid
  console.log("⏳ Simulating claim...");
  try {
    await provider.call({
      to: AIRDROP_CONTRACT,
      data: txClaim.data,
      from: compromisedWallet.address,
    });
    console.log("✅ Simulation successful");
  } catch (err) {
    console.error("❌ Simulation failed:", decodeError(err));
    return;
  }

  const flashbotsProvider = await FlashbotsBundleProvider.create(provider, sponsorWallet);

  const gasSettings = {
    maxFeePerGas: ethers.parseUnits("6", "gwei"), // change for your needs
    maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"), // change for your needs
  };

  const signedBundle = await flashbotsProvider.signBundle([
    {
      signer: compromisedWallet,
      transaction: {
        chainId: 1,
        type: 2,
        to: AIRDROP_CONTRACT,
        data: txClaim.data,
        gasLimit: 200000,
        nonce,
        ...gasSettings,
        value: 0,
      },
    },
    {
      signer: compromisedWallet,
      transaction: {
        chainId: 1,
        type: 2,
        to: TOKEN_CONTRACT,
        data: txTransfer.data,
        gasLimit: 100000,
        nonce: nonce + 1,
        ...gasSettings,
        value: 0,
      },
    },
  ]);

  const targetBlock = (await provider.getBlockNumber()) + 1;

  const res = await flashbotsProvider.sendRawBundle(signedBundle, targetBlock);

  if ("error" in res) {
    console.error("❌ Flashbots error:", res.error.message);
    return;
  }

  console.log("🚀 Bundle submitted. Waiting for inclusion in block:", targetBlock);
  const receipt = await res.wait();

  if (receipt === 0) {
    console.log("❌ Bundle not included.");
  } else {
    console.log("✅ Bundle included. Claim + transfer succeeded.");
  }
}

// === ERROR DECODER ===
function decodeError(err) {
  try {
    const json = err.error?.body ? JSON.parse(err.error.body) : {};
    return json.error?.message || err.message;
  } catch {
    return err.message;
  }
}

main();
