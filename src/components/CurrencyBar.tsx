"use client"
import getInventory from "@/actions/getInventory"
import dynamic from "next/dynamic"

const CurrencyBox = dynamic(() => import('../components/CurrencyBox'), { ssr: false })

export default function CurrencyBar() {
  const {inventory} = getInventory()

  return (
    <div className="currency-bar">
      <CurrencyBox id="dreamless_seed" amount={inventory["dreamless_seed"] || 0} icon="/materials/city_dreamless_seed.png"/>
      <CurrencyBox id="beetle_coin" amount={inventory["beetle_coin"] || 0} icon="/materials/currency_beetle_coin.png"/>
      <CurrencyBox id="fons" amount={inventory["fons"] || 0}  icon="/materials/currency_fons.png"/>
    </div>
  )
}