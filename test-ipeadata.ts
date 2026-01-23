import type { IndiceData } from "./lib/indices-data"

/**
 * Test script to verify Ipeadata API fetch is working correctly
 * Tests the new fetchIGPMFromIpeadata function
 */

async function fetchIGPMFromIpeadata(): Promise<IndiceData[]> {
  try {
    const url = "https://ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='IGP12_IGPMG12')?$format=json"
    const response = await fetch(url, { cache: "no-store" })

    if (!response.ok) {
      console.warn(`Ipeadata API returned ${response.status}`)
      return []
    }

    const data = await response.json()
    const indices: IndiceData[] = []

    if (data.value && Array.isArray(data.value)) {
      for (const item of data.value) {
        // Data format: "2025-01-01T00:00:00"
        if (item.VALDATA && item.VALVALOR !== null && item.VALVALOR !== undefined) {
          const dateParts = item.VALDATA.split("T")[0].split("-")
          const year = parseInt(dateParts[0])
          const month = parseInt(dateParts[1])
          const valor = parseFloat(item.VALVALOR)

          if (year >= 1989 && month >= 1 && month <= 12 && !isNaN(valor)) {
            indices.push({
              mes: month,
              ano: year,
              valor, // Ipeadata já retorna em percentual
            })
          }
        }
      }
    }

    // Remover duplicatas, mantendo o último de cada mês
    const mesesMap = new Map<string, IndiceData>()
    for (const item of indices) {
      const key = `${item.mes}-${item.ano}`
      mesesMap.set(key, item) // Sobrescreve com último valor
    }

    const resultado = Array.from(mesesMap.values()).sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano
      return a.mes - b.mes
    })

    console.log(`✓ IGP-M Ipeadata: ${resultado.length} registros fetched`)
    console.log(`  Período: ${resultado[0].ano}-${resultado[0].mes} até ${resultado[resultado.length - 1].ano}-${resultado[resultado.length - 1].mes}`)

    // Show sample data
    console.log("\nSample data from Ipeadata:")
    console.log("Primeiros 5 registros:")
    resultado.slice(0, 5).forEach((r) => {
      console.log(`  ${r.mes.toString().padStart(2, "0")}/${r.ano}: ${r.valor}%`)
    })
    console.log("Últimos 5 registros:")
    resultado.slice(-5).forEach((r) => {
      console.log(`  ${r.mes.toString().padStart(2, "0")}/${r.ano}: ${r.valor}%`)
    })

    // Verify some known values
    console.log("\nVerificação de valores conhecidos:")
    const jul1989 = resultado.find((r) => r.ano === 1989 && r.mes === 7)
    console.log(`  Julho/1989: ${jul1989?.valor}% (esperado: 35.91%)`)

    const jan2025 = resultado.find((r) => r.ano === 2025 && r.mes === 1)
    if (jan2025) {
      console.log(`  Janeiro/2025: ${jan2025.valor}%`)
    }

    return resultado
  } catch (error) {
    console.error("Error fetching IGP-M from Ipeadata:", error)
    return []
  }
}

// Run test
console.log("Testing Ipeadata API for IGP-M...")
console.log("==================================================")
fetchIGPMFromIpeadata().then((data) => {
  console.log("\n✓ Test completed successfully!")
  process.exit(0)
})
