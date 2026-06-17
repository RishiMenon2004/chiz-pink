"use client"

import getInventory from "@/actions/getInventory"
import dynamic from "next/dynamic"
import PageTitle from "@/components/PageTitle"

const CurrencyBox = dynamic(() => import('../components/CurrencyBox'), { ssr: false })

export default function CurrencyBar() {
  const {inventory} = getInventory()

  return (
    <div className="title-bar">
      <PageTitle/>
      <span className="currency-section">
        <CurrencyBox id="dreamless_seed" amount={inventory["dreamless_seed"]} icon="/materials/city_dreamless_seed.png"/>
        <CurrencyBox id="beetle_coin" amount={inventory["beetle_coin"]} icon="/materials/currency_beetle_coin.png"/>
        <CurrencyBox id="fons" amount={inventory["fons"]}  icon="/materials/currency_fons.png"/>
      </span>
    </div>
  )
}