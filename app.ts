import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import {
  createV1,
  mplCore,
  createCollectionV1,
  pluginAuthorityPair,
  ruleSet,
} from "@metaplex-foundation/mpl-core";

import {
  TransactionBuilderSendAndConfirmOptions,
  createSignerFromKeypair,
  generateSigner,
  Keypair as umiKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";

import type { PublicKey as umiPublicKey } from "@metaplex-foundation/umi-public-keys";

import { Keypair as web3Keypair, Connection } from "@solana/web3.js";

import { mykey, collection } from "./config/config.json";
import { name, uri } from "./config/nftData.json";

//create UMI to connect solana devnet.
const umi = createUmi("https://api.devnet.solana.com", "processed").use(
    mplCore()
);

//get the umiKeypair from keypair json file
const WALLET = web3Keypair.fromSecretKey(new Uint8Array(mykey));
const wallet_publicKey: umiPublicKey =
  WALLET.publicKey.toBase58() as umiPublicKey;

const COLLECTION = web3Keypair.fromSecretKey(new Uint8Array(collection));
const collection_publicKey: umiPublicKey =
  COLLECTION.publicKey.toBase58() as umiPublicKey;

const payer_keypair: umiKeypair = {
  publicKey: wallet_publicKey,
  secretKey: WALLET.secretKey,
};

const collection_keypair: umiKeypair = {
  publicKey: collection_publicKey,
  secretKey: COLLECTION.secretKey,
};

//make accounts' addresses for umi
const payer = createSignerFromKeypair(umi, payer_keypair); //my wallet address
const asset = generateSigner(umi); // new token account address

//make collection address for umi
const collectionAddress = createSignerFromKeypair(umi, collection_keypair);

//determine signer in umi
umi.use(signerIdentity(payer));

const txConfig: TransactionBuilderSendAndConfirmOptions = {
  send: { skipPreflight: true },
  confirm: { commitment: "processed" },
};

async function main() {
    await createCollectionV1(umi, {
        name: "Quick Collection",
        uri: "https://your.domain.com/collection.json",
        collection: collectionAddress,
        updateAuthority: payer.publicKey,
        plugins: [
        pluginAuthorityPair({
            type: "Royalties",
            data: {
            basisPoints: 300,
            creators: [
                {
                address: payer.publicKey,
                percentage: 100,
                },
            ],
            ruleSet: ruleSet("None"), // Compatibility rule set
            },
        }),
        ],
    }).sendAndConfirm(umi, txConfig);
    console.log("collection creating success");

    await createV1(umi, {
        name: name,
        uri: uri,
        asset: asset,
        collection: collectionAddress.publicKey,
        authority: payer,
    }).sendAndConfirm(umi, txConfig);
    console.log("token minting success");
}

main().catch(console.error);
