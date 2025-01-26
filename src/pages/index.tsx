import React, { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Market } from '@openbook-dex/openbook';
import { notify } from '../../utils/notifications';
import { AiOutlineClose } from 'react-icons/ai';

export const OpenBookMarketView = ({ setOpenBookMarket }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [openBookMarket, setOpenBookMarket] = useState(false);

// ... in the JSX
{openBookMarket && (
  <div className="new_loader relative h-full bg-slate-900">
    <OpenBookMarketView setOpenBookMarket={setOpenBookMarket} />
  </div>
)}
  const generateMarketId = useCallback(async () => {
    if (!publicKey) {
      notify({ type: 'error', message: 'Please connect your wallet!' });
      return;
    }

    setIsLoading(true);
    try {
      // Create new market
      const marketId = await Market.createMarket({
        connection,
        wallet: {
          publicKey,
          sendTransaction: async (tx) => {
            const signature = await sendTransaction(tx, connection);
            await connection.confirmTransaction(signature);
            return signature;
          }
        },
        baseMint: new PublicKey('...'), // Base token mint
        quoteMint: new PublicKey('...'), // Quote token mint
        baseLotSize: 1,
        quoteLotSize: 1,
      });

      notify({
        type: 'success', 
        message: 'Market created successfully!',
        txid: marketId.toString()
      });

    } catch (error) {
      notify({ 
        type: 'error',
        message: 'Failed to create market: ' + error.message 
      });
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connection, sendTransaction]);

  return (
    <section className="py-20">
      <div className="container">
        <div className="bg-default-950/40 rounded-xl backdrop-blur-3xl">
          <div className="p-10">
            <h2 className="text-3xl font-medium text-white mb-6">
              Create OpenBook Market
            </h2>
            
            <button
              onClick={generateMarketId}
              disabled={!publicKey || isLoading}
              className="bg-primary-600/90 hover:bg-primary-600 group mt-5 inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-white backdrop-blur-2xl transition-all duration-500"
            >
              <span className="fw-bold">
                {isLoading ? 'Creating Market...' : 'Create Market'}
              </span>
            </button>

            <div className="text-center mt-6">
              <a
                onClick={() => setOpenBookMarket(false)}
                className="group inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/80 backdrop-blur-2xl transition-all duration-500 hover:bg-primary cursor-pointer"
              >
                <i className="text-2xl text-white">
                  <AiOutlineClose />
                </i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};