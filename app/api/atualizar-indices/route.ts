import { type NextRequest, NextResponse } from "next/server"
import { fetchAllIndices } from "@/lib/fetch-indices"

export async function POST(request: NextRequest) {
  try {
    console.log("=".repeat(60))
    console.log("INICIANDO ATUALIZAÇÃO DE ÍNDICES DE SITES OFICIAIS")
    console.log("=".repeat(60))
    console.log(`Horário: ${new Date().toLocaleString("pt-BR")}`)

    // Fetch data from all official sources
    const resultado = await fetchAllIndices()

    console.log("=".repeat(60))
    console.log("RESULTADO DA ATUALIZAÇÃO")
    console.log("=".repeat(60))

    // Log which indices were updated
    const indicesAtualizados: Array<{name: string, count: number}> = []
    if (resultado["IGP-M"].length > 0) {
      indicesAtualizados.push({name: "IGP-M", count: resultado["IGP-M"].length})
      console.log(`✓ IGP-M: ${resultado["IGP-M"].length} registros atualizados`)
    }
    if (resultado["IPCA"].length > 0) {
      indicesAtualizados.push({name: "IPCA", count: resultado["IPCA"].length})
      console.log(`✓ IPCA: ${resultado["IPCA"].length} registros atualizados`)
    }
    if (resultado["INPC"].length > 0) {
      indicesAtualizados.push({name: "INPC", count: resultado["INPC"].length})
      console.log(`✓ INPC: ${resultado["INPC"].length} registros atualizados`)
    }
    if (resultado["Poupança"].length > 0) {
      indicesAtualizados.push({name: "Poupança", count: resultado["Poupança"].length})
      console.log(`✓ Poupança: ${resultado["Poupança"].length} registros atualizados`)
    }
    if (resultado["SELIC"].length > 0) {
      indicesAtualizados.push({name: "SELIC", count: resultado["SELIC"].length})
      console.log(`✓ SELIC: ${resultado["SELIC"].length} registros atualizados`)
    }
    if (resultado["CDI"].length > 0) {
      indicesAtualizados.push({name: "CDI", count: resultado["CDI"].length})
      console.log(`✓ CDI: ${resultado["CDI"].length} registros atualizados`)
    }

    console.log(`Total de índices atualizados: ${resultado.successCount}`)
    console.log("=".repeat(60))

    const mensagemIndices = indicesAtualizados.map(i => `${i.name} (${i.count} registros)`).join(", ")

    return NextResponse.json({
      success: true,
      indicesAtualizados: indicesAtualizados,
      total: resultado.successCount,
      timestamp: resultado.timestamp,
      message: `${resultado.successCount} índice(s) foram atualizados com sucesso dos sites oficiais: ${mensagemIndices}`,
      data: {
        "IGP-M": resultado["IGP-M"],
        "IPCA": resultado["IPCA"],
        "INPC": resultado["INPC"],
        "Poupança": resultado["Poupança"],
        "SELIC": resultado["SELIC"],
        "CDI": resultado["CDI"],
      },
      detalhes: {
        "IGP-M": `${resultado["IGP-M"].length} registros (API Banco Central - Série 189 FGV)`,
        "IPCA": `${resultado["IPCA"].length} registros (API Banco Central - Série 433 IBGE)`,
        "INPC": `${resultado["INPC"].length} registros (API Banco Central - Série 188 IBGE)`,
        "Poupança": `${resultado["Poupança"].length} registros (API Banco Central - Série 195)`,
        "SELIC": `${resultado["SELIC"].length} registros (API Banco Central - Série 11)`,
        "CDI": `${resultado["CDI"].length} registros (API Banco Central - Série 12)`,
      },
      fontes: {
        "IGP-M": "https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?formato=json",
        "IPCA": "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json",
        "INPC": "https://api.bcb.gov.br/dados/serie/bcdata.sgs.188/dados?formato=json",
        "Poupança": "https://api.bcb.gov.br/dados/serie/bcdata.sgs.195/dados?formato=json",
        "SELIC": "https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json",
        "CDI": "https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados?formato=json",
      }
    })
  } catch (error) {
    console.error("Erro ao atualizar índices:", error)
    console.error("=".repeat(60))
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao atualizar índices dos sites oficiais",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
