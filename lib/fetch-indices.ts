import { IndiceData } from "./indices-data"

// Fetch IGP-M from FGV using Banco Central API
async function fetchIGPMFromFGV(): Promise<IndiceData[]> {
  try {
    // IGP-M via Banco Central SGS API (series 189)
    const response = await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?formato=json")

    if (!response.ok) {
      throw new Error(`Banco Central API returned ${response.status}`)
    }

    const data = await response.json() as Array<{ data: string; valor: string }>
    const indices: IndiceData[] = []

    for (const item of data) {
      const [day, month, year] = item.data.split("/")
      const valor = parseFloat(item.valor.replace(",", "."))

      if (day && month && year && !isNaN(valor)) {
        indices.push({
          mes: parseInt(month),
          ano: parseInt(year),
          valor,
        })
      }
    }

    console.log(`[FETCH] IGP-M: ${indices.length} registros fetched from Banco Central`)
    return indices
  } catch (error) {
    console.error("Error fetching IGP-M from Banco Central:", error)
    return []
  }
}

// Fetch IPCA from IBGE
async function fetchIPCAFromIBGE(): Promise<IndiceData[]> {
  try {
    // IBGE SGS API for IPCA (series 433)
    const response = await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json")

    if (!response.ok) {
      throw new Error(`IBGE API returned ${response.status}`)
    }

    const data = await response.json() as Array<{ data: string; valor: string }>
    const indices: IndiceData[] = []

    for (const item of data) {
      const [day, month, year] = item.data.split("/")
      const valor = parseFloat(item.valor.replace(",", "."))

      if (day && month && year && !isNaN(valor)) {
        indices.push({
          mes: parseInt(month),
          ano: parseInt(year),
          valor,
        })
      }
    }

    console.log(`[FETCH] IPCA: ${indices.length} registros fetched from Banco Central`)
    return indices
  } catch (error) {
    console.error("Error fetching IPCA from Banco Central:", error)
    return []
  }
}

// Fetch INPC from IBGE
async function fetchINPCFromIBGE(): Promise<IndiceData[]> {
  try {
    // IBGE SGS API for INPC (series 188)
    const response = await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.188/dados?formato=json")

    if (!response.ok) {
      throw new Error(`INPC API returned ${response.status}`)
    }

    const data = await response.json() as Array<{ data: string; valor: string }>
    const indices: IndiceData[] = []

    for (const item of data) {
      const [day, month, year] = item.data.split("/")
      const valor = parseFloat(item.valor.replace(",", "."))

      if (day && month && year && !isNaN(valor)) {
        indices.push({
          mes: parseInt(month),
          ano: parseInt(year),
          valor,
        })
      }
    }

    console.log(`[FETCH] INPC: ${indices.length} registros fetched from Banco Central`)
    return indices
  } catch (error) {
    console.error("Error fetching INPC from Banco Central:", error)
    return []
  }
}

// Fetch Poupança from Banco Central
async function fetchPoupancaFromBC(): Promise<IndiceData[]> {
  try {
    // Banco Central SGS API for Poupança (series 195 - taxa média de remuneração)
    const response = await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.195/dados?formato=json", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      }
    })

    if (!response.ok) {
      throw new Error(`Banco Central API returned ${response.status}`)
    }

    const data = await response.json() as Array<{ data: string; valor: string }>
    const indices: IndiceData[] = []

    for (const item of data) {
      const [day, month, year] = item.data.split("/")
      const valor = parseFloat(item.valor.replace(",", "."))

      if (day && month && year && !isNaN(valor)) {
        indices.push({
          mes: parseInt(month),
          ano: parseInt(year),
          valor,
        })
      }
    }

    console.log(`[FETCH] Poupança: ${indices.length} registros fetched from Banco Central`)
    return indices
  } catch (error) {
    console.error("Error fetching Poupança from Banco Central:", error)
    return []
  }
}

// Fetch SELIC from Banco Central
async function fetchSELICFromBC(): Promise<IndiceData[]> {
  try {
    // Banco Central SGS API for SELIC (series 11 - taxa média diária)
    const response = await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      }
    })

    if (!response.ok) {
      throw new Error(`Banco Central API returned ${response.status}`)
    }

    const data = await response.json() as Array<{ data: string; valor: string }>
    const indices: IndiceData[] = []

    for (const item of data) {
      const [day, month, year] = item.data.split("/")
      const valor = parseFloat(item.valor.replace(",", "."))

      if (day && month && year && !isNaN(valor)) {
        // Group SELIC by month (calculate monthly average)
        const existing = indices.find((i) => i.mes === parseInt(month) && i.ano === parseInt(year))
        if (existing) {
          // Average multiple daily values in the same month
          existing.valor = (existing.valor + valor) / 2
        } else {
          indices.push({
            mes: parseInt(month),
            ano: parseInt(year),
            valor,
          })
        }
      }
    }

    console.log(`[FETCH] SELIC: ${indices.length} registros fetched from Banco Central`)
    return indices
  } catch (error) {
    console.error("Error fetching SELIC from Banco Central:", error)
    return []
  }
}

// Fetch CDI from Banco Central
async function fetchCDIFromBC(): Promise<IndiceData[]> {
  try {
    // Banco Central SGS API for CDI (series 12 - taxa média diária)
    const response = await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados?formato=json", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      }
    })

    if (!response.ok) {
      throw new Error(`Banco Central API returned ${response.status}`)
    }

    const data = await response.json() as Array<{ data: string; valor: string }>
    const indices: IndiceData[] = []

    for (const item of data) {
      const [day, month, year] = item.data.split("/")
      const valor = parseFloat(item.valor.replace(",", "."))

      if (day && month && year && !isNaN(valor)) {
        // Group CDI by month (calculate monthly average)
        const existing = indices.find((i) => i.mes === parseInt(month) && i.ano === parseInt(year))
        if (existing) {
          // Average multiple daily values in the same month
          existing.valor = (existing.valor + valor) / 2
        } else {
          indices.push({
            mes: parseInt(month),
            ano: parseInt(year),
            valor,
          })
        }
      }
    }

    console.log(`[FETCH] CDI: ${indices.length} registros fetched from Banco Central`)
    return indices
  } catch (error) {
    console.error("Error fetching CDI from Banco Central:", error)
    return []
  }
}

export async function fetchAllIndices(): Promise<{
  "IGP-M": IndiceData[]
  "IPCA": IndiceData[]
  "INPC": IndiceData[]
  "Poupança": IndiceData[]
  "SELIC": IndiceData[]
  "CDI": IndiceData[]
  timestamp: string
  successCount: number
}> {
  const results = {
    "IGP-M": [] as IndiceData[],
    "IPCA": [] as IndiceData[],
    "INPC": [] as IndiceData[],
    "Poupança": [] as IndiceData[],
    "SELIC": [] as IndiceData[],
    "CDI": [] as IndiceData[],
    timestamp: new Date().toISOString(),
    successCount: 0,
  }

  // Fetch from all sources in parallel
  const [igpm, ipca, inpc, poupanca, selic, cdi] = await Promise.allSettled([
    fetchIGPMFromFGV(),
    fetchIPCAFromIBGE(),
    fetchINPCFromIBGE(),
    fetchPoupancaFromBC(),
    fetchSELICFromBC(),
    fetchCDIFromBC(),
  ])

  if (igpm.status === "fulfilled" && igpm.value.length > 0) {
    results["IGP-M"] = igpm.value
    results.successCount++
  }
  if (ipca.status === "fulfilled" && ipca.value.length > 0) {
    results["IPCA"] = ipca.value
    results.successCount++
  }
  if (inpc.status === "fulfilled" && inpc.value.length > 0) {
    results["INPC"] = inpc.value
    results.successCount++
  }
  if (poupanca.status === "fulfilled" && poupanca.value.length > 0) {
    results["Poupança"] = poupanca.value
    results.successCount++
  }
  if (selic.status === "fulfilled" && selic.value.length > 0) {
    results["SELIC"] = selic.value
    results.successCount++
  }
  if (cdi.status === "fulfilled" && cdi.value.length > 0) {
    results["CDI"] = cdi.value
    results.successCount++
  }

  return results
}
