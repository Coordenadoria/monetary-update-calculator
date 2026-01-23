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

/**
 * Buscar Poupança do BCB (série 25 - rentabilidade mensal acumulada)
 * Série: 25 (Poupança - % mensal acumulado por aniversário)
 */
async function fetchPoupancaFromBCB(): Promise<IndiceData[]> {
  try {
    const url = "/api/proxy-bcb?serie=25&dataInicial=01/01/1989&dataFinal=31/12/2025"
    const response = await fetch(url, { cache: "no-store", timeout: 10000 })

    if (!response.ok) {
      console.warn(`BCB API (Poupança) returned ${response.status}`)
      return []
    }

    const data = await response.json()
    const indices: IndiceData[] = []

    if (Array.isArray(data)) {
      const processedDates = new Set<string>()

      for (const item of data) {
        // Usar apenas o primeiro dia de cada mês
        if (item.data && item.valor) {
          const dateParts = item.data.split("/")
          const day = parseInt(dateParts[0])
          const month = parseInt(dateParts[1])
          const year = parseInt(dateParts[2])
          const dateKey = `${month}-${year}`

          // Pega apenas primeiro dia do mês
          if (day === 1 && !processedDates.has(dateKey)) {
            const valor = parseFloat(item.valor.replace(",", "."))

            if (year >= 1989 && month >= 1 && month <= 12 && !isNaN(valor)) {
              indices.push({
                mes: month,
                ano: year,
                valor,
              })
              processedDates.add(dateKey)
            }
          }
        }
      }
    }

    const resultado = indices.sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano
      return a.mes - b.mes
    })

    console.log(`[FETCH] Poupança BCB: ${resultado.length} registros fetched (${resultado.length > 0 ? `${resultado[0].ano}-${resultado[resultado.length - 1].ano}` : "vazio"})`)
    return resultado
  } catch (error) {
    console.error("Error fetching Poupança from BCB:", error)
    return []
  }
}

/**
 * Buscar IGP-M do BCB (série 189)
 * Série: 189 (IGP-M - % mensal)
 */
async function fetchIGPMFromBCB(): Promise<IndiceData[]> {
  try {
    const url = "/api/proxy-bcb?serie=189"
    const response = await fetch(url, { cache: "no-store", timeout: 10000 })

    if (!response.ok) {
      console.warn(`BCB API (IGP-M) returned ${response.status}`)
      // Tentar Ipeadata como fallback
      return await fetchIGPMFromIpeadata()
    }

    const data = await response.json()
    const indices: IndiceData[] = []

    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.data && item.valor) {
          const dateParts = item.data.split("/")
          const day = parseInt(dateParts[0])
          const month = parseInt(dateParts[1])
          const year = parseInt(dateParts[2])

          // Usar primeiro dia do mês
          if (day === 1) {
            const valor = parseFloat(item.valor.replace(",", "."))

            if (year >= 1989 && month >= 1 && month <= 12 && !isNaN(valor)) {
              indices.push({
                mes: month,
                ano: year,
                valor,
              })
            }
          }
        }
      }
    }

    const resultado = indices.sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano
      return a.mes - b.mes
    })

    console.log(`[FETCH] IGP-M BCB: ${resultado.length} registros fetched (${resultado.length > 0 ? `${resultado[0].ano}-${resultado[resultado.length - 1].ano}` : "vazio"})`)
    return resultado
  } catch (error) {
    console.error("Error fetching IGP-M from BCB:", error)
    // Fallback para Ipeadata
    return await fetchIGPMFromIpeadata()
  }
}

export async function fetchAllIndices(): Promise<{
  "IGP-M": IndiceData[]
  "Poupança": IndiceData[]
  timestamp: string
  successCount: number
}> {
  const results = {
    "IGP-M": [] as IndiceData[],
    "Poupança": [] as IndiceData[],
    timestamp: new Date().toISOString(),
    successCount: 0,
  }

  // Fetch IGP-M e Poupança em paralelo
  const [igpmResult, poupancaResult] = await Promise.allSettled([
    fetchIGPMFromBCB(),
    fetchPoupancaFromBCB(),
  ])

  if (igpmResult.status === "fulfilled" && igpmResult.value.length > 0) {
    results["IGP-M"] = igpmResult.value
    results.successCount++
  }

  if (poupancaResult.status === "fulfilled" && poupancaResult.value.length > 0) {
    results["Poupança"] = poupancaResult.value
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
      console.log(`[CACHE] ✓ IGP-M: ${indicesObtidos["IGP-M"].length} registros salvos`)
    }

    if (indicesObtidos["Poupança"].length > 0) {
      localStorage.setItem("indices_Poupança", JSON.stringify(indicesObtidos["Poupança"]))
      console.log(`[CACHE] ✓ Poupança: ${indicesObtidos["Poupança"].length} registros salvos`)
    }

    // Salvar timestamp da última atualização
    localStorage.setItem("indices_timestamp", indicesObtidos.timestamp)

    console.log(`[CACHE] ✅ Índices atualizados com sucesso: ${indicesObtidos.successCount} fontes`)
    return true
  } catch (error) {
    console.error("[CACHE] Erro ao atualizar índices no cache:", error)
    return false
  }
}
