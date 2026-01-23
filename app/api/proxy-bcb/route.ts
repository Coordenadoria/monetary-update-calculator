import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const serie = searchParams.get("serie") // 189 para IGP-M, 25 para Poupança
  let dataInicial = searchParams.get("dataInicial")
  let dataFinal = searchParams.get("dataFinal")

  if (!serie) {
    return NextResponse.json(
      { error: "Parâmetro 'serie' é obrigatório" },
      { status: 400 }
    )
  }

  try {
    let url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados?formato=json`

    // Série 25 (Poupança) requer obrigatoriamente dataInicial e dataFinal
    // Série 189 (IGP-M) funcionam sem essas parâmetros, mas também funcionam com
    if (!dataInicial) {
      dataInicial = "01/01/1989"
    }
    if (!dataFinal) {
      const today = new Date()
      const day = String(today.getDate()).padStart(2, "0")
      const month = String(today.getMonth() + 1).padStart(2, "0")
      const year = today.getFullYear()
      dataFinal = `${day}/${month}/${year}`
    }

    // Para série diária (25 - Poupança), datas são obrigatórias
    // Para série mensal (189 - IGP-M), são opcionais mas incluímos mesmo assim
    url += `&dataInicial=${encodeURIComponent(dataInicial)}&dataFinal=${encodeURIComponent(dataFinal)}`

    console.log(`[Proxy BCB] Buscando série ${serie}: ${url}`)

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Proxy BCB] Erro ${response.status}: ${errorText}`)
      throw new Error(`BCB API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    // Tratar caso onde BCB retorna erro em JSON
    if (data.error) {
      console.warn(`[Proxy BCB] Erro da API para série ${serie}:`, data.message)
      return NextResponse.json([], {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      })
    }

    // Validar que é um array
    if (!Array.isArray(data)) {
      console.warn(`[Proxy BCB] Resposta não é array para série ${serie}:`, typeof data)
      return NextResponse.json([], {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      })
    }

    console.log(`[Proxy BCB] Série ${serie}: ${data.length} registros retornados`)
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("[Proxy BCB] Erro:", error)
    return NextResponse.json(
      {
        error: "Erro ao buscar dados da API do BCB",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    )
  }
}
