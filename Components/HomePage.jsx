import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import Token from "./artifacts/contracts/Token.sol/Token.json";
import Voting from "./artifacts/contracts/Voting.sol/VotingApp.json";

const LOCAL_CHAIN_ID = 1337;
const SEPOLIA_CHAIN_ID = 11155111;

const DEFAULT_ADDRESSES = {
  greeter: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
  token: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
  voting: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
};

const shortAddress = (address) =>
  address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—";

const formatError = (error) => {
  if (error?.code === 4001) return "Transaction rejected in MetaMask.";
  if (error?.reason) return error.reason;
  if (error?.data?.message) return error.data.message;
  if (error?.message) {
    return error.message
      .replace("execution reverted: ", "")
      .replace("MetaMask Tx Signature: User denied transaction signature.", "Transaction rejected.");
  }
  return "Something went wrong. Please try again.";
};



const HomePage = () => {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [chainId, setChainId] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [newGreeting, setNewGreeting] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);
  const [tokenBalance, setTokenBalance] = useState("");
  const [tokenRecipient, setTokenRecipient] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [voteCandidate, setVoteCandidate] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark");

const addresses = useMemo(
  () => ({
    greeter:
      process.env.NEXT_PUBLIC_GREETER_ADDRESS ||
      DEFAULT_ADDRESSES.greeter,

    token:
      process.env.NEXT_PUBLIC_TOKEN_ADDRESS ||
      DEFAULT_ADDRESSES.token,

    voting:
      process.env.NEXT_PUBLIC_VOTING_ADDRESS ||
      DEFAULT_ADDRESSES.voting,
  }),
  []
);

  const targetChainId = Number(
    process.env.NEXT_PUBLIC_CHAIN_ID || LOCAL_CHAIN_ID
  );

  const explorerUrl =
    process.env.NEXT_PUBLIC_EXPLORER_URL ||
    (targetChainId === SEPOLIA_CHAIN_ID
      ? "https://sepolia.etherscan.io"
      : "");

  const isTargetNetwork = chainId === targetChainId;

  const getProvider = useCallback(() => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    return new ethers.providers.Web3Provider(window.ethereum, "any");
  }, []);

  const refreshWallet = useCallback(
    async (silent = false) => {
      if (!window.ethereum) {
        if (!silent) setError("Install MetaMask to use the DApp.");
        return;
      }

      try {
        const provider = getProvider();
        const network = await provider.getNetwork();
        const accounts = await provider.listAccounts();
        const activeAccount = accounts[0] || "";

        setChainId(Number(network.chainId));
        setNetworkName(
          network.name === "unknown"
            ? `Chain ${network.chainId}`
            : network.name
        );
        setAccount(activeAccount);

        if (activeAccount) {
          const walletBalance = await provider.getBalance(activeAccount);
          setBalance(
            Number(ethers.utils.formatEther(walletBalance)).toLocaleString(
              undefined,
              { maximumFractionDigits: 5 }
            )
          );
        } else {
          setBalance("");
        }
      } catch (walletError) {
        if (!silent) setError(formatError(walletError));
      }
    },
    [getProvider]
  );

  const loadGreeting = useCallback(async () => {
    if (!addresses.greeter || !ethers.utils.isAddress(addresses.greeter)) return;

    try {
      const provider = getProvider();

      const contract = new ethers.Contract(
        addresses.greeter,
        Greeter.abi,
        provider
      );
      setGreeting(await contract.greet());

      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latestBlock - 250);
      const events = await contract.queryFilter(
        contract.filters.GreetingChanged(),
        fromBlock,
        latestBlock
      );

      setEventHistory(
        events
          .slice(-5)
          .reverse()
          .map((event) => ({
            hash: event.transactionHash,
            block: event.blockNumber,
            oldGreeting: event.args.oldGreeting,
            newGreeting: event.args.newGreeting,
          }))
      );
    } catch (loadError) {
      console.error(loadError);
    }
  }, [addresses.greeter, getProvider]);

  const loadToken = useCallback(async () => {
    if (!addresses.token || !account || !ethers.utils.isAddress(addresses.token)) {
      setTokenBalance("");
      return;
    }

    try {
      const provider = getProvider();
      const contract = new ethers.Contract(
        addresses.token,
        Token.abi,
        provider
      );
      const value = await contract.balanceOf(account);
      setTokenBalance(ethers.utils.commify(value.toString()));
    } catch (tokenError) {
      console.error(tokenError);
      setTokenBalance("");
    }
  }, [account, addresses.token, getProvider]);

  const loadVoting = useCallback(async () => {
    if (!addresses.voting || !ethers.utils.isAddress(addresses.voting)) {
      setCandidates([]);
      setVoteCounts({});
      setVoteCandidate("");
      return;
    }

    try {
      const provider = getProvider();
      const contract = new ethers.Contract(
        addresses.voting,
        Voting.abi,
        provider
      );

      const list = await contract.getCandidates();
      setCandidates(list);

      const counts = {};
      for (const candidate of list) {
        counts[candidate] = (await contract.totalVotesFor(candidate)).toString();
      }
      setVoteCounts(counts);

      if (!voteCandidate && list[0]) setVoteCandidate(list[0]);
    } catch (votingError) {
      console.error(votingError);
    }
  }, [addresses.voting, getProvider, voteCandidate]);

useEffect(() => {
  const savedTheme = window.localStorage.getItem("chainspace-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    setTheme(savedTheme);
  }
}, []);

useEffect(() => {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem("chainspace-theme", theme);
}, [theme]);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  useEffect(() => {
    if (!window.ethereum) return undefined;

    const onAccountsChanged = () => refreshWallet(true);
    const onChainChanged = () => window.location.reload();

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged", onChainChanged);
    };
  }, [refreshWallet]);

  useEffect(() => {
    if (account && isTargetNetwork) {
      loadGreeting();
      loadToken();
      loadVoting();
    }
  }, [account, isTargetNetwork, loadGreeting, loadToken, loadVoting]);

  const connectWallet = async () => {
    setError("");
    if (!window.ethereum) {
      setError("MetaMask is not installed.");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await refreshWallet();
    } catch (walletError) {
      setError(formatError(walletError));
    }
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;

    const hexChainId = `0x${targetChainId.toString(16)}`;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        if (targetChainId === LOCAL_CHAIN_ID) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x539",
                chainName: "Hardhat Local",
                nativeCurrency: {
                  name: "Ether",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["http://127.0.0.1:8545"],
              },
            ],
          });
        } else if (targetChainId === SEPOLIA_CHAIN_ID) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } else {
          setError("The configured network is not supported by the automatic switcher.");
        }
      } else {
        setError(formatError(switchError));
      }
    }
  };

  const changeGreeting = async () => {
    if (!newGreeting.trim()) return setError("Write a greeting first.");
    if (!isTargetNetwork) return setError("Switch to the configured network first.");

    try {
      setError("");
      setLoading(true);
      setActiveAction("greeting");

      const provider = getProvider();
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        addresses.greeter,
        Greeter.abi,
        signer
      );

      const tx = await contract.setGreeting(newGreeting.trim());

      setTransaction({
        hash: tx.hash,
        status: "Pending",
        block: null,
        gas: null,
      });

      const receipt = await tx.wait();

      setTransaction({
        hash: tx.hash,
        status: "Confirmed",
        block: receipt.blockNumber,
        gas: receipt.gasUsed.toString(),
      });

      setNewGreeting("");
      await loadGreeting();
      await refreshWallet(true);
    } catch (txError) {
      setError(formatError(txError));
    } finally {
      setLoading(false);
      setActiveAction("");
    }
  };

  const transferTokens = async () => {
    if (!isTargetNetwork) {
      return setError("Switch to the configured network first.");
    }

    if (!ethers.utils.isAddress(tokenRecipient)) {
      return setError("Enter a valid recipient address.");
    }

    if (!/^\d+$/.test(tokenAmount.trim())) {
      return setError("Token amount must be a positive whole number.");
    }

    let amount;
    try {
      amount = ethers.BigNumber.from(tokenAmount.trim());
      if (amount.lte(0)) {
        return setError("Token amount must be a positive whole number.");
      }
    } catch {
      return setError("Token amount is too large or invalid.");
    }

    if (!addresses.token || !ethers.utils.isAddress(addresses.token)) {
      return setError("Token contract is not deployed/configured yet.");
    }

    try {
      setError("");
      setLoading(true);
      setActiveAction("token");

      const provider = getProvider();
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        addresses.token,
        Token.abi,
        signer
      );

      const tx = await contract.transfer(tokenRecipient, amount);

      setTransaction({
        hash: tx.hash,
        status: "Pending",
        block: null,
        gas: null,
      });

      const receipt = await tx.wait();

      setTransaction({
        hash: tx.hash,
        status: "Confirmed",
        block: receipt.blockNumber,
        gas: receipt.gasUsed.toString(),
      });

setTokenRecipient("");
setTokenAmount("");

try {
  await loadToken();
} catch (balanceError) {
  console.error("Token balance refresh failed:", balanceError);
}
    } catch (txError) {
      setError(formatError(txError));
    } finally {
      setLoading(false);
      setActiveAction("");
    }
  };

  const castVote = async () => {
    if (!voteCandidate) return setError("Choose a candidate.");
    if (!isTargetNetwork) return setError("Switch to the configured network first.");
    if (!addresses.voting) {
      return setError("Voting contract is not deployed/configured yet.");
    }

    try {
      setError("");
      setLoading(true);
      setActiveAction("vote");

      const provider = getProvider();
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        addresses.voting,
        Voting.abi,
        signer
      );

      const tx = await contract.voteForCandidates(voteCandidate);

      setTransaction({
        hash: tx.hash,
        status: "Pending",
        block: null,
        gas: null,
      });

      const receipt = await tx.wait();

      setTransaction({
        hash: tx.hash,
        status: "Confirmed",
        block: receipt.blockNumber,
        gas: receipt.gasUsed.toString(),
      });

      await loadVoting();
    } catch (txError) {
      setError(formatError(txError));
    } finally {
      setLoading(false);
      setActiveAction("");
    }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-bg pointer-events-none fixed inset-0 z-0" />
      <div className="orb orb-one fixed z-0" />
      <div className="orb orb-two fixed z-0" />
      <div className="orb orb-three fixed z-0" />

      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <button
          onClick={() => scrollTo("top")}
          className="group flex items-center gap-3 text-left"
        >
          <div className="chain-cube hidden sm:block">
            <span>◈</span><span>◇</span><span>◆</span>
            <span>◇</span><span>◈</span><span>◆</span>
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-[0.32em] text-cyan-200">
              ChainSpace
            </div>
            <div className="text-xs text-slate-500">
              Smart Contract Studio
            </div>
          </div>
        </button>

        <div className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
          <button onClick={() => scrollTo("studio")} className="transition hover:text-white">
            Studio
          </button>
          <button onClick={() => scrollTo("events")} className="transition hover:text-white">
            Events
          </button>
          <button onClick={() => scrollTo("voting")} className="transition hover:text-white">
            Voting
          </button>
        </div>

<div className="flex items-center gap-2">
  <button
    type="button"
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    className="theme-toggle"
    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
  >
    <span className="theme-toggle-icon">
      {theme === "dark" ? "☀" : "☾"}
    </span>

    <span className="hidden sm:inline">
      {theme === "dark" ? "Light" : "Dark"}
    </span>
  </button>

  <button
    type="button"
    onClick={connectWallet}
    className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 hover:bg-cyan-300/15"
  >
    {account ? shortAddress(account) : "Connect wallet"}
  </button>
</div>
      </nav>

      <section id="top" className="relative z-10 mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-8 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/5 px-3 py-1.5 text-xs font-semibold text-emerald-200">
              <span className="status-dot h-2 w-2 rounded-full bg-emerald-300" />
              {isTargetNetwork ? "Network ready" : "Network needs attention"}
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[.95] tracking-[-0.045em] sm:text-7xl">
              <span className="block text-white">Build on-chain.</span>
              <span className="gradient-text neon-text block">
                See every transaction.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              A cinematic Web3 playground for reading contracts, signing
              transactions, exploring events and watching state change in
              real time.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo("studio")}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-gray-900 shadow-2xl shadow-cyan-500/10 transition hover:-translate-y-1"
              >
                Enter the studio →
              </button>
              {!isTargetNetwork && (
                <button
                  onClick={switchNetwork}
                  className="rounded-2xl border border-violet-300/25 bg-violet-300/10 px-5 py-3 text-sm font-bold text-violet-100 transition hover:-translate-y-1 hover:bg-violet-300/15"
                >
                  Switch to {process.env.NEXT_PUBLIC_NETWORK_NAME || "target network"}
                </button>
              )}
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs text-slate-500">
              <span>⚡ ethers.js</span>
              <span>◈ Solidity</span>
              <span>⬡ Hardhat</span>
              <span>✦ MetaMask</span>
            </div>
          </div>

          <div className="glass card-3d relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="relative">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[.22em] text-slate-500">
                    Wallet telemetry
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">
                    {account ? "Connected" : "Awaiting connection"}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
                  {networkName || "No network"}
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
                  <div className="text-xs text-slate-500">ADDRESS</div>
                  <div className="mt-2 break-all font-mono text-sm text-cyan-100">
                    {account || "Connect MetaMask to begin"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
                    <div className="text-xs text-slate-500">ETH BALANCE</div>
                    <div className="mt-2 text-xl font-black text-white">
                      {balance || "—"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
                    <div className="text-xs text-slate-500">CHAIN ID</div>
                    <div className="mt-2 text-xl font-black text-white">
                      {chainId || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Browser wallet · {isTargetNetwork ? "ready to sign" : "switch network"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <section className="relative z-20 mx-auto max-w-7xl px-5 sm:px-8">
          <div className="rounded-2xl border border-rose-300/20 bg-rose-400/5 px-5 py-4 text-sm text-rose-100">
            <div className="flex items-start justify-between gap-4">
              <span>{error}</span>
              <button onClick={() => setError("")} className="text-rose-300/70 hover:text-white">
                ×
              </button>
            </div>
          </div>
        </section>
      )}

      <section id="studio" className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-[.3em] text-cyan-300/70">
            01 / Contract studio
          </div>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Interact with the chain.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Read live state, sign a contract write, and inspect the exact
            transaction receipt returned by the network.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="glass card-3d rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
                GREETER
              </span>
              <span className="text-xs text-slate-600">READ + WRITE</span>
            </div>

            <div className="mt-7 rounded-2xl border border-cyan-300/10 bg-cyan-300/5 p-5">
              <div className="text-xs uppercase tracking-widest text-slate-500">
                Current state
              </div>
              <div className="greeting-value mt-3 min-h-[56px] text-xl font-bold">
                “{greeting || "Loading contract…"}”
              </div>
            </div>

            <div className="mt-4">
              <input
                value={newGreeting}
                onChange={(event) => setNewGreeting(event.target.value)}
                placeholder="Write a new greeting"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/30"
              />
              <button
                onClick={changeGreeting}
                disabled={loading || !account}
                className="cs-action mt-3 w-full"
              >
                {activeAction === "greeting" ? "Signing…" : "Change greeting"}
              </button>
            </div>
          </div>

          <div className="glass card-3d rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-violet-300/10 px-3 py-1.5 text-xs font-bold text-violet-200">
                TOKEN
              </span>
              <span className="text-xs text-slate-600">TRANSFER</span>
            </div>

            <div className="mt-7 rounded-2xl border border-violet-300/10 bg-violet-300/5 p-5">
              <div className="text-xs uppercase tracking-widest text-slate-500">
                Your LT balance
              </div>
              <div className="mt-2 text-3xl font-black text-white">
                {tokenBalance || "—"} <span className="text-sm text-violet-200">LT</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <input
                value={tokenRecipient}
                onChange={(event) => setTokenRecipient(event.target.value)}
                placeholder="Recipient 0x…"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-300/30"
              />
              <input
                value={tokenAmount}
                onChange={(event) => setTokenAmount(event.target.value)}
                placeholder="Amount"
                type="number"
                min="1"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-300/30"
              />
              <button
                onClick={transferTokens}
                disabled={loading || !account || !addresses.token}
                className="cs-action cs-action-violet w-full"
              >
                {activeAction === "token" ? "Signing…" : "Send LT"}
              </button>
            </div>
          </div>

          <div id="voting" className="glass card-3d rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-pink-300/10 px-3 py-1.5 text-xs font-bold text-pink-200">
                VOTING
              </span>
              <span className="text-xs text-slate-600">ON-CHAIN</span>
            </div>

            <div className="mt-7 space-y-3">
              {candidates.length ? (
                candidates.map((candidate) => (
                  <button
                    key={candidate}
                    onClick={() => setVoteCandidate(candidate)}
                    className={`vote-candidate flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                      voteCandidate === candidate
                        ? "selected"
                        : ""
                    }`}
                  >
                    <span className="font-mono text-xs text-slate-300">
                      {shortAddress(candidate)}
                    </span>
                    <span className="font-black text-white">
                      {voteCounts[candidate] || 0}
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-5 text-sm text-slate-500">
                  Deploy/configure the voting contract to activate this panel.
                </div>
              )}
            </div>

            <button
              onClick={castVote}
              disabled={loading || !account || !voteCandidate}
              className="cs-action cs-action-pink mt-4 w-full"
            >
              {activeAction === "vote" ? "Casting vote…" : "Cast vote"}
            </button>
          </div>
        </div>
      </section>

      <section id="events" className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="glass rounded-3xl p-7">
            <div className="text-xs font-bold uppercase tracking-[.3em] text-violet-300/70">
              02 / Transaction telemetry
            </div>
            <h2 className="mt-2 text-2xl font-black">
              Your latest receipt.
            </h2>

            {transaction ? (
              <div className="terminal mt-6 rounded-2xl p-5 font-mono text-xs leading-7">
                <div>
                  <span className="text-slate-600">status</span>{" "}
                  <span className={transaction.status === "Confirmed" ? "text-emerald-300" : "text-amber-300"}>
                    {transaction.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">hash</span>{" "}
                  <span className="break-all text-cyan-200">
                    {transaction.hash}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">block</span>{" "}
                  <span className="text-white">
                    {transaction.block ?? "pending…"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">gasUsed</span>{" "}
                  <span className="text-white">
                    {transaction.gas ?? "pending…"}
                  </span>
                </div>

                {explorerUrl && transaction.hash && (
                  <a
                    href={`${explorerUrl}/tx/${transaction.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-cyan-300 hover:text-white"
                  >
                    Open in explorer ↗
                  </a>
                )}
              </div>
            ) : (
              <div className="terminal mt-6 rounded-2xl p-6 text-sm leading-7 text-slate-500">
                Execute a contract write and the signed transaction will
                appear here with its block and gas receipt.
              </div>
            )}
          </div>

          <div className="glass rounded-3xl p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="text-xs font-bold uppercase tracking-[.3em] text-cyan-300/70">
                  03 / Event stream
                </div>
                <h2 className="mt-2 text-2xl font-black">
                  Greeting history.
                </h2>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-slate-500">
                Last 250 blocks
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {eventHistory.length ? (
                eventHistory.map((event) => (
                  <div
                    key={event.hash}
                    className="rounded-2xl border border-white/8 bg-slate-950/35 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs text-cyan-200">
                        {shortAddress(event.hash)}
                      </span>
                      <span className="text-xs text-slate-600">
                        block {event.block}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                      <div className="rounded-xl bg-white/5 p-3 text-sm text-slate-400">
                        {event.oldGreeting}
                      </div>
                      <span className="text-center text-cyan-300">→</span>
                      <div className="rounded-xl bg-cyan-300/5 p-3 text-sm font-semibold text-white">
                        {event.newGreeting}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-6 text-sm text-slate-500">
                  No GreetingChanged events found yet. Change the greeting to
                  create the first event.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-8">
        <div className="border-t border-white/8 pt-6 text-center text-xs text-slate-600">
          ChainSpace · Ethereum smart-contract playground · Built with Solidity,
          Hardhat, ethers.js & Next.js
        </div>
      </footer>
    </main>
  );
};

export default HomePage;