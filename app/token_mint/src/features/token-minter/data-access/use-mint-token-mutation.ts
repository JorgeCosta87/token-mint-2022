"use client"
import { useMutation } from '@tanstack/react-query'
import { Address, createTransaction, getBase58Decoder, signAndSendTransactionMessageWithSigners } from 'gill'
import { useSolana } from '@/components/solana/use-solana'
import { UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { toast } from 'sonner'
import { toastTx } from '@/components/toast-tx'
import { getMintTokenInstructionAsync} from '../../../../clients/js/src/generated/instructions/'
import { TOKEN_2022_PROGRAM_ADDRESS } from "gill/programs";

type MintTokenArgs = {
  mintAddress: Address
  recipient: Address
  amount: number
}

export function useMintTokenMutation({ account }: { account: UiWalletAccount }) {
  const { client } = useSolana()
  const mintAuthority = useWalletUiSigner({ account })

  return useMutation({
    mutationFn: async ({ mintAddress, recipient, amount }: MintTokenArgs) => {
      const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()

      const instruction = await getMintTokenInstructionAsync({
        mintAuthority,
        recipient,
        mintAccount: mintAddress,
        amount,
        tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
      })

      const transaction = createTransaction({
        feePayer: mintAuthority,
        version: 0,
        latestBlockhash,
        instructions: [instruction],
      })

      const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
      const signature = getBase58Decoder().decode(signatureBytes)

      return signature
    },
    onSuccess: (tx) => {
      toastTx(tx)
    },
    onError: (error) => {
      toast.error(`Mint failed: ${String(error)}`)
    },
  })
}


