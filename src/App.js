import './App.css';
// import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from './utilis/WavePortal.json'
// import { entropyToMnemonic } from 'ethers/lib/utils';

function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [allWaves, setAllWaves] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chainId, setChainId] = useState('');

  const contractAddress = '0xC6de4511942CaAc4eB9Bb0BFbCc545d3b9e2e3c9';
  let contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
//eslint-disable-next-line
  }, []);


 
  const getAllWaves = async () => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

      const waves = await wavePortalContract.getAllWaves();
      console.log("waves:", waves);

      let wavesCleaned = [];
      waves.forEach(wave => {
        wavesCleaned.push({
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        });
      });

      setAllWaves(wavesCleaned);
    }
  }


  const connectWallet = async () => {

  const { ethereum } = window;

    if (!ethereum) {
      alert("Install Metamsk")
    }
    else {
      // const accounts = await ethereum.request({ method: "eth_requestAccounts" });          //Code for without fetching chain id
      // console.log("Connected:", accounts[0]);
      // setCurrentAccount(accounts[0]);
      // alert('Wallet is successfully connected');
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected:", accounts[0]);
      // const chainid= ethereum.request({ method: 'eth_chainId' });    // Wasn't fetching chain id here
            //  if(chainId == '0x4')           //Other direct method of switching chains if above line works
            //  {
            //  setCurrentAccount(accounts[0]);
            //  alert('Wallet is successfully connecteddd');
            //  }
            // else{
              const changeChain=async()=>{
              await ethereum.request({method:"wallet_switchEthereumChain",
              params:[
               {
                 chainId:'0x4'
               }]});
              }
              await changeChain();
              setCurrentAccount(accounts[0]);
              alert('Wallet is successfully Connected');
              setChainId('0x4');
    }
  }

  const wave = async () => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
      const { ethereum } = window;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      // const chainid= ethereum.request({ method: 'eth_chainId' });    // This was not fetching chain id from metamask
      if (accounts.length == 0) {
        alert("Please connect your wallet");
        return;
      }
    }
    else {
      alert("Please install metamask and connect wallet");
      return;
    }

    const { ethereum } = window;
    // const chainId = ethereum.request({ method: 'eth_chainId' });   // This was not fetching chain id from metamask
    if (ethereum && chainId == '0x4') {

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log("WaveportalContract",wavePortalContract);
      console.log("4");
      let count = await wavePortalContract.getTotalWaves();      
      console.log("waves", count.toNumber());
      const waveTxn = await wavePortalContract.wave(inputText);
      console.log("Mining...", waveTxn.hash);
      alert("Please wait for 5-10sec");
      await waveTxn.wait();
      console.log("Mined -- ", waveTxn.hash);
      getAllWaves();
      document.getElementById('texty').value = '';
      count = await wavePortalContract.getTotalWaves();
      console.log("Retrieved total wave count...", count.toNumber());
      // window.location.reload();  //Not advisable as it will refresh the page (can implement same by directly calling the getAllWaves function)
    }
    else if (chainId !== '0x4'){alert("Please switch to Rinkeby Testnet");}
  }

  return (
    <div className="App">
      <header className='App-header'>
        <div className="containermain">
          <div className='intro'>Hello👋 , Wanna share something? </div>
          <div className="biotext">You can share anything related to blockchain, crypto, web3 or even related to this project (Don't forget to link your <span><b>Metamask (Rinkeby Testnet Account) </b>using connect wallet button) </span></div>
          <div className="container">
            <input type="text" placeholder='Enter your text' className='App texty' id='texty' onChange={e => {
              setInputText(e.target.value);
            }} /><br />
            <button id='button' className="btn-1" onClick={wave}>Send ✌️</button>
            {!currentAccount ? (<button id='button' className="btn-2" onClick={connectWallet}> Connect Wallet</button>) : (<b className='bold'>Account Address: {currentAccount}</b>)}
          </div>
          <h1> <span className='messages'>Messages</span></h1>
          {allWaves.slice(0).reverse().map((wave, index) => {
            return (
              <div className='card' key={index} style={{ backgroundColor: " ", marginTop: "8px", padding: "8px" }}>
                <div className='msgbox'>
                  <div className='address'>Address: {wave.address}</div>
                  <div className='message'>Message: {wave.message}</div>
                  <div className='time'>Time: {wave.timestamp.toString()}</div></div>
              </div>)
          })}
        </div>
      </header>


    </div>
  );
}

export default App;
