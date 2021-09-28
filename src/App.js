import "./styles/App.css";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import myEpicNFT from "./utils/MyEpicNFT.json";
import "bootstrap/dist/css/bootstrap.min.css";

import Footer from "./components/Footer";
import Header from "./components/Header";

// Constants
const OPENSEA_LINK =
  "https://testnets.opensea.io/collection/squarenft-9sbhj0ixm7";
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x75469a9e4987071566F9838767965e73F6D17B41";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isMining, setIsMining] = useState(false);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have Metamask!");
      return;
    } else {
      console.log("We have the ethereum object -- ", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      console.log(`Authorized account found.`);
      console.log(`Found account with address -- ${accounts[0]}`);
      setCurrentAccount(accounts[0]);
    } else {
      console.log(`No Authorized account found :(`);
    }
    setupEventListener();
  };

  const connectWallet = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Make sure you have Metamask!");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    if (accounts.length !== 0) {
      console.log(`Authorized account found.`);
      console.log(`Connected to -- ${accounts[0]}`);
      setCurrentAccount(accounts[0]);
    } else {
      console.log(`No Authorized account found :(`);
    }
    setupEventListener();
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNFT.abi,
          signer
        );

        contract.on("NewEpicNFTMinted", (from, itemId) => {
          console.log(from, itemId.toNumber());
          alert(
            `Hey there! We've minted your NFT. It may be blank right now. 
            It can take a max of 10 min to show up on OpenSea. Here's the link: 
            https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${itemId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNFT = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNFT.abi,
          signer
        );

        const txn = await contract.makeAnEpicNFT();
        setIsMining(true);
        console.log(`Mining...`);

        await txn.wait();
        setIsMining(false);
        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${txn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <div>
      <button className="cta-button mint-button" onClick={askContractToMintNFT}>
        Mint NFT
      </button>
    </div>
  );

  const renderMiningUI = () => (
    <button class="cta-button mint-button m-3" type="button" disabled>
      <span
        class="spinner-grow spinner-grow-sm mx-2"
        role="status"
        aria-hidden="true"
      ></span>
      Mining...
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <Header />
          <button className="cta-button opensea-button mb-3" href>
            <a className="text-light" href={OPENSEA_LINK}>
              🌊 View Collection on OpenSea
            </a>
          </button>
          {currentAccount === "" ? renderNotConnectedContainer() : null}
          {isMining ? renderMiningUI() : renderMintUI()}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default App;
