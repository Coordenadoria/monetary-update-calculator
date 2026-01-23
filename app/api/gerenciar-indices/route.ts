import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // Retornar índices atualizados dos sites oficiais via APIs
    const responses = await Promise.allSettled([
      // Poupança do Banco Central
      fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.195/dados?formato=json").then((r) => r.json()),
      // IGP-M do IPEA
      fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?formato=json").then((r) => r.json()),
      // IPCA do IBGE
      fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json").then((r) => r.json()),
      // INPC do IBGE
      fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.188/dados?formato=json").then((r) => r.json()),
      // SELIC
      fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json").then((r) => r.json()),
      // CDI
      fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados?formato=json").then((r) => r.json()),
    ])

    const indices: Record<string, any[]> = {
      Poupança: [],
      "IGP-M": [],
      IPCA: [],
      INPC: [],
      SELIC: [],
      CDI: [],
    }

    const nomes = ["Poupança", "IGP-M", "IPCA", "INPC", "SELIC", "CDI"]

    responses.forEach((response, index) => {
      if (response.status === "fulfilled" && Array.isArray(response.value)) {
        indices[nomes[index]] = response.value
          .map((item: any) => {
            const dataParts = item.data.split("/")
            if (dataParts.length === 3) {
              return {
                mes: parseInt(dataParts[1]),
                ano: parseInt(dataParts[2]),
                valor: parseFloat(item.valor),
                fonte: "BCB - API",
              }
            }
            return null
          })
          .filter((item: any) => item !== null)
      }
    })

    return NextResponse.json(indices)
  } catch (error) {
    console.error("Erro ao buscar índices:", error)
    return NextResponse.json({ error: "Erro ao buscar índices" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { indice, mes, ano, valor } = body

    // Validar dados
    if (!indice || !mes || !ano || valor === undefined) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Aqui você poderia salvar em um banco de dados
    // Por enquanto, apenas confirmamos a operação
    return NextResponse.json({
      success: true,
      message: `Índice ${indice} ${mes}/${ano} atualizado para ${valor}`,
      data: { indice, mes, ano, valor },
    })
  } catch (error) {
    console.error("Erro ao atualizar índice:", error)
    return NextResponse.json({ error: "Erro ao atualizar índice" }, { status: 500 })
  }
}
