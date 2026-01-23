import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const serie = searchParams.get("serie") // 189 para IGP-M, 25 para Poupança
  const dataInicial = searchParams.get("dataInicial")
  const dataFinal = searchParams.get("dataFinal")

  if (!serie) {
    return NextResponse.json(
      { error: "Parâmetro 'serie' é obrigatório" },
      { status: 400 }
    )
  }

  try {
    let url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados?formato=json`

    if (dataInicial) {
      url += `&dataInicial=${encodeURIComponent(dataInicial)}`
    }
    if (dataFinal) {
      url += `&dataFinal=${encodeURIComponent(dataFinal)}`
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`BCB API returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao buscar dados do BCB:", error)
    return NextResponse.json(
      {
        error: "Erro ao buscar dados da API do BCB",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    )
  }
}
