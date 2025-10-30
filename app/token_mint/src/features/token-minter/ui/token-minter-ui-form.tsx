"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UiWalletAccount } from '@wallet-ui/react'
import { useMintTokenMutation } from '../data-access/use-mint-token-mutation'
import { type Address } from 'gill'
import { useCreateMintMutation } from '../data-access/use-create-mint-mutation'

export function TokenMinterUiForm({ account }: { account: UiWalletAccount }) {
  const [name, setName] = useState('TANGAROO')
  const [symbol, setSymbol] = useState('TAGOO')
  const [uri, setUri] = useState('')
  const [decimals, setDecimals] = useState(9)
  const [metaJson, setMetaJson] = useState<unknown>(null)
  const [metaImg, setMetaImg] = useState<string>('')
  const [metaError, setMetaError] = useState<string>('')

  const createMint = useCreateMintMutation({ account })
  const mintToken = useMintTokenMutation({ account })
  const [mintAddress, setMintAddress] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState(1)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setMetaError('')
      setMetaJson(null)
      setMetaImg('')
      if (!uri || !/^https?:\/\//.test(uri)) return
      try {
        const res = await fetch(uri, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (cancelled) return
        setMetaJson(json)
        const img = (json && typeof json === 'object' && 'image' in json) ? (json as any).image : ''
        if (typeof img === 'string') setMetaImg(img)
      } catch (e) {
        if (!cancelled) setMetaError(String(e))
      }
    }
    const id = setTimeout(run, 400)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [uri])

  return (
    <div className="space-y-6">
      <Card>
      <CardHeader>
        <CardTitle>Token Minter</CardTitle>
        <CardDescription>Create a new mint with metadata preview.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tm-name">Name</Label>
              <Input id="tm-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Token" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-symbol">Symbol</Label>
              <Input id="tm-symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="MTK" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-uri">Metadata URI</Label>
              <Input id="tm-uri" value={uri} onChange={(e) => setUri(e.target.value)} placeholder="https://.../metadata.json" />
              {metaError ? <p className="text-sm text-red-500">{metaError}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-decimals">Decimals</Label>
              <Input id="tm-decimals" type="number" min={0} max={9} value={decimals} onChange={(e) => setDecimals(parseInt(e.target.value || '0'))} />
            </div>
            <div>
              <Button
                variant="outline"
                disabled={createMint.isPending || !name || !symbol || !uri || Number.isNaN(decimals)}
                onClick={() => createMint.mutateAsync({ name, symbol, uri, decimals })}
              >
                {createMint.isPending ? 'Creating…' : 'Create Mint'}
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="aspect-square w-full overflow-hidden rounded-md border bg-muted flex items-center justify-center">
              {metaImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={metaImg} alt="metadata" className="object-cover w-full h-full" />
              ) : (
                <span className="text-muted-foreground text-sm">No image</span>
              )}
            </div>
            <div className="text-sm">
              <Label>Metadata JSON</Label>
              <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
{typeof metaJson === 'object' ? JSON.stringify(metaJson, null, 2) : metaJson ? String(metaJson) : '{}'}
              </pre>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
      <Card>
      <CardHeader>
        <CardTitle>Mint Tokens</CardTitle>
        <CardDescription>Mint tokens to a recipient (creates ATA if missing).</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mint-address">Mint Address</Label>
              <Input id="mint-address" value={mintAddress} onChange={(e) => setMintAddress(e.target.value)} placeholder="Mint public key" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient-address">Recipient Address</Label>
              <Input id="recipient-address" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient public key" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mint-amount">Amount</Label>
              <Input id="mint-amount" type="number" min={0} value={amount} onChange={(e) => setAmount(parseInt(e.target.value || '0'))} />
            </div>
            <div>
              <Button
                variant="outline"
                disabled={mintToken.isPending || !mintAddress || !recipient || Number.isNaN(amount) || amount <= 0}
                onClick={() =>
                  mintToken.mutateAsync({
                    mintAddress: mintAddress as unknown as Address,
                    recipient: recipient as unknown as Address,
                    amount,
                  })
                }
              >
                {mintToken.isPending ? 'Minting…' : 'Mint'}
              </Button>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  )
}


