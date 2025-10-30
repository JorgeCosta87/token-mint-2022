"use client"
import { Button } from '@/components/ui/button'
import { UiWalletAccount } from '@wallet-ui/react'
import { useCreateMintMutation } from '../data-access/use-create-mint-mutation'

export function TokenMinterUiButtonCreate({ account }: { account: UiWalletAccount }) {
  const createMint = useCreateMintMutation({ account })

  return (
    <Button
      variant="outline"
      onClick={async () => {
        const name = window.prompt('Token name:', 'My Token') || ''
        const symbol = window.prompt('Token symbol:', 'MTK') || ''
        const uri = window.prompt('Metadata URI:', 'https://example.com/metadata.json') || ''
        const decimalsInput = window.prompt('Decimals (0-9):', '9') || '9'
        const decimals = parseInt(decimalsInput)
        if (!name || !symbol || !uri || Number.isNaN(decimals)) return
        await createMint.mutateAsync({ name, symbol, uri, decimals })
      }}
      disabled={createMint.isPending}
    >
      Create Mint
    </Button>
  )
}


