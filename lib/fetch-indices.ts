import { IndiceData } from "./indices-data"

/**
 * Buscar IGP-M do Ipeadata (API oficial com dados mais confiáveis)
 * Series: IGP12_IGPMG12 (IGP-M Geral - % mensal)
 */
async function fetchIGPMFromIpeadata(): Promise<IndiceData[]> {
  try {
    const url = "https://ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='IGP12_IGPMG12')?$format=json"
    const response = await fetch(url, { cache: "no-store", timeout: 10000 })

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

    console.log(`[FETCH] IGP-M Ipeadata: ${resultado.length} registros fetched (${resultado.length > 0 ? `${resultado[0].ano}-${resultado[resultado.length - 1].ano}` : "vazio"})`)
    return resultado
  } catch (error) {
    console.error("Error fetching IGP-M from Ipeadata:", error)
    return []
  }
}

// Fetch IGP-M from FGV using Banco Central API with multi-window support (1989-2026)
async function fetchIGPMFromFGV(): Promise<IndiceData[]> {
  try {
    const todosDados: IndiceData[] = []

    // Janelas de 10 anos para contornar limite da API BACEN
    const janelas = [
      { inicio: "01/01/1989", fim: "31/12/1998" },
      { inicio: "01/01/1999", fim: "31/12/2008" },
      { inicio: "01/01/2009", fim: "31/12/2018" },
      { inicio: "01/01/2019", fim: "31/12/2026" },
    ]

    for (const janela of janelas) {
      try {
        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?formato=json&dataInicial=${janela.inicio}&dataFinal=${janela.fim}`
        const response = await fetch(url, { cache: "no-store" })

        if (response.ok) {
          const data = await response.json() as Array<{ data: string; valor: string }>

          for (const item of data) {
            const [day, month, year] = item.data.split("/")
            const valor = parseFloat(item.valor.replace(",", "."))

            if (day && month && year && !isNaN(valor)) {
              todosDados.push({
                mes: parseInt(month),
                ano: parseInt(year),
                valor,
              })
            }
          }
        }
      } catch (error) {
        console.warn(`Erro ao buscar janela IGP-M (${janela.inicio} - ${janela.fim}):`, error)
      }
    }

    // Remover duplicatas e ordenar
    const mesesMap = new Map<string, IndiceData>()
    for (const item of todosDados) {
      const key = `${item.mes}-${item.ano}`
      // Manter o último valor do mês
      if (!mesesMap.has(key) || item.mes > 0) {
        mesesMap.set(key, item)
      }
    }

    const indices = Array.from(mesesMap.values()).sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano
      return a.mes - b.mes
    })

    console.log(`[FETCH] IGP-M: ${indices.length} registros fetched from Banco Central (1989-2026)`)
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
  // NOTE: Using Ipeadata for IGP-M instead of BACEN FGV for more accurate official data
  const [igpm, ipca, inpc, poupanca, selic, cdi] = await Promise.allSettled([
    fetchIGPMFromIpeadata(),
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

/**
 * Atualizar índices no cache local (localStorage)
 * Chamado antes de cada cálculo para garantir dados atualizados
 */
export async function atualizarIndicesNoCache(): Promise<boolean> {
  try {
    const indicesObtidos = await fetchAllIndices()

    if (indicesObtidos.successCount === 0) {
      console.warn("[CACHE] Nenhum índice foi obtido da API")
      return false
    }

    // Salvar cada índice no localStorage
    if (indicesObtidos["IGP-M"].length > 0) {
      localStorage.setItem("indices_IGP-M", JSON.stringify(indicesObtidos["IGP-M"]))
    }
    if (indicesObtidos["IPCA"].length > 0) {
      localStorage.setItem("indices_IPCA", JSON.stringify(indicesObtidos["IPCA"]))
    }
    if (indicesObtidos["INPC"].length > 0) {
      localStorage.setItem("indices_INPC", JSON.stringify(indicesObtidos["INPC"]))
    }
    if (indicesObtidos["Poupança"].length > 0) {
      localStorage.setItem("indices_Poupança", JSON.stringify(indicesObtidos["Poupança"]))
    }

    // Salvar timestamp da última atualização
    localStorage.setItem("indices_timestamp", indicesObtidos.timestamp)

    console.log(`[CACHE] Índices atualizados com sucesso: ${indicesObtidos.successCount} fontes`)
    return true
  } catch (error) {
    console.error("[CACHE] Erro ao atualizar índices no cache:", error)
    return false
  }
}
