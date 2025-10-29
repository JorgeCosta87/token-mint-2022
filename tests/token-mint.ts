import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TokenMint } from "../target/types/token_mint";
import { getMint, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

describe("token-mint", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env(); 
  anchor.setProvider(provider);

  const program = anchor.workspace.tokenMint as Program<TokenMint>;

  const mintKeypair = new anchor.web3.Keypair();

  const metadata = {
    "name": "TANGAROO",
    "symbol": "TAGOO",
    uri: '',
  };

  it('Create an SPL token with MetadataPointer and Token metadata extensions', async () => {
    const tx = await program.methods
      .createMint(metadata, 9)
      .accounts({ mint: mintKeypair.publicKey })
      .signers([mintKeypair])
      .rpc({ skipPreflight: true });
    console.log('Your transaction signature', tx);

    await program.provider.connection.confirmTransaction(tx, 'confirmed');

    const mintInfo = await getMint(
      program.provider.connection,
      mintKeypair.publicKey,
      'confirmed',
      TOKEN_2022_PROGRAM_ID
    );

    console.log('Mint: ', {
      address: mintKeypair.publicKey.toString(),
      decimals: mintInfo.decimals,
      supply: mintInfo.supply.toString(),
      mintAuthority: mintInfo.mintAuthority.toString(),
      freezeAuthority: mintInfo.freezeAuthority.toString(),
    });

  });
});
