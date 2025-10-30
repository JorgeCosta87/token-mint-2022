"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UiWalletAccount, useWalletUi } from '@wallet-ui/react'
import { TokenMinterUiForm } from './ui/token-minter-ui-form'

export default function TokenMinterFeature() {
  const { account } = useWalletUi()
  const selected = (account as UiWalletAccount) || null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {selected ? (
        <TokenMinterUiForm account={selected} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Token Minter</CardTitle>
            <CardDescription>Connect a wallet to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">No wallet connected.</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


