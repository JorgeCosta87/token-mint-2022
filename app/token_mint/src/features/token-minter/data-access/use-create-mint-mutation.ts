"use client"
import { useMutation } from '@tanstack/react-query'
import { createTransaction, generateKeyPairSigner, getBase58Decoder, signAndSendTransactionMessageWithSigners } from 'gill'
import { useSolana } from '@/components/solana/use-solana'
import { UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { toast } from 'sonner'
import { toastTx } from '@/components/toast-tx'
import { getCreateMintInstruction } from '../../../../clients/js/src/generated/instructions'

type CreateMintArgs = {
  name: string
  symbol: string
  uri: string
  decimals: number
}

export function useCreateMintMutation({ account }: { account: UiWalletAccount }) {
  const { client } = useSolana()
  const payer = useWalletUiSigner({ account })

  return useMutation({
    mutationFn: async ({ name, symbol, uri, decimals }: CreateMintArgs) => {
      const mint = await generateKeyPairSigner()

      const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()

      const instruction = getCreateMintInstruction({
        payer,
        mint,
        name,
        symbol,
        uri,
        decimals,
      })

      const transaction = createTransaction({
        feePayer: payer,
        version: 0,
        latestBlockhash,
        instructions: [instruction],
      })

      const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
      const signature = getBase58Decoder().decode(signatureBytes)

      return { signature, mintAddress: mint.address }
    },
    onSuccess: ({ signature }) => {
      toastTx(signature)
    },
    onError: (error) => {
      toast.error(`Create mint failed: ${String(error)}`)
    },
  })
}


