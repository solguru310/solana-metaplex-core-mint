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

// Create Main function

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
