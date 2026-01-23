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

// Fetch Poupança from Banco Central
async function fetchPoupancaFromBC(): Promise<IndiceData[]> {
  try {
    // Banco Central SGS API for Poupança (series 195 - taxa média de remuneração)
    // Series 195 requer data inicial e final (máximo 10 anos por janela)
    // IMPORTANTE: A API retorna uma linha para CADA DIA
    // Devemos usar o PRIMEIRO valor útil de cada mês (começo do período)
    
    const todosDados: IndiceData[] = []
    const janelas = [
      { inicio: "01/01/1994", fim: "31/12/2003" },
      { inicio: "01/01/2004", fim: "31/12/2013" },
      { inicio: "01/01/2014", fim: "31/12/2023" },
      { inicio: "01/01/2024", fim: "31/12/2026" },
    ]

    for (const janela of janelas) {
      try {
        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.195/dados?formato=json&dataInicial=${janela.inicio}&dataFinal=${janela.fim}`
        const response = await fetch(url, { cache: "no-store" })

        if (!response.ok) {
          console.warn(`BACEN Poupança janela ${janela.inicio}-${janela.fim} retornou ${response.status}`)
          continue
        }

        const data = await response.json() as Array<{ data: string; valor: string }>
        
        // Agrupar por mês/ano e usar o PRIMEIRO valor (primeiro dia útil do mês)
        const porMes = new Map<string, { data: string; valor: string }>()
        for (const item of data) {
          const [day, month, year] = item.data.split("/")
          const key = `${month}-${year}`
          // Usa o primeiro valor de cada mês (se não estiver setado ainda)
          if (!porMes.has(key)) {
            porMes.set(key, item)
          }
        }

        // Converter para IndiceData
        for (const [key, item] of porMes.entries()) {
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
      } catch (janelError) {
        console.warn(`Erro na janela Poupança ${janela.inicio}-${janela.fim}:`, janelError)
        continue
      }
    }

    // Ordenar cronologicamente
    const indicesOrdenados = todosDados.sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano
      return a.mes - b.mes
    })

    console.log(`[FETCH] Poupança: ${indicesOrdenados.length} registros fetched from Banco Central (usando primeiro dia útil de cada mês)`)
    return indicesOrdenados
  } catch (error) {
    console.error("Error fetching Poupança from Banco Central:", error)
    return []
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

  // Fetch from both sources in parallel
  const [igpm, poupanca] = await Promise.allSettled([
    fetchIGPMFromIpeadata(),
    fetchPoupancaFromBC(),
  ])

  if (igpm.status === "fulfilled" && igpm.value.length > 0) {
    results["IGP-M"] = igpm.value
    results.successCount++
  }
  if (poupanca.status === "fulfilled" && poupanca.value.length > 0) {
    results["Poupança"] = poupanca.value
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
