#!/usr/bin/env node

/**
 * TEST: Validar que parcelamento usa valor CORRIGIDO
 * 
 * Cenário:
 * - Valor original: R$ 296.556,65
 * - Data inicial: 23/03/2020
 * - Data final: 26/01/2026
 * - Índice: Poupança
 * - Número de parcelas: 24
 * 
 * Esperado:
 * - Valor corrigido: ~R$ 436.762,458
 * - Valor de cada parcela: R$ 436.762,458 ÷ 24 = ~R$ 18.198,436
 * 
 * ANTES (ERRADO):
 * - Parcelas: 296.556,65 ÷ 24 = R$ 12.356,527
 * 
 * DEPOIS (CORRETO):
 * - Parcelas: 436.762,458 ÷ 24 = R$ 18.198,436
 */

import { calcularCorrecaoMonetaria } from "./lib/calculo-monetario.ts"

async function testarParcelamento() {
  console.log("🧪 TESTE: Parcelamento com Valor Corrigido\n")

  const parametros = {
    valorOriginal: 296_556.65,
    dataInicial: {
      dia: 23,
      mes: 3,
      ano: 2020,
    },
    dataFinal: {
      dia: 26,
      mes: 1,
      ano: 2026,
    },
    indice: "Poupança",
    correcaoProRata: true,
    numeroParcelas: 24,
    dataParcelamento: {
      dia: 26,
      mes: 1,
      ano: 2026,
    },
  }

  console.log("📋 Parâmetros do cálculo:")
  console.log(`   Valor original: R$ ${parametros.valorOriginal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`)
  console.log(`   Período: ${parametros.dataInicial.dia}/${parametros.dataInicial.mes}/${parametros.dataInicial.ano} até ${parametros.dataFinal.dia}/${parametros.dataFinal.mes}/${parametros.dataFinal.ano}`)
  console.log(`   Índice: ${parametros.indice}`)
  console.log(`   Parcelas: ${parametros.numeroParcelas}`)
  console.log()

  const resultado = await calcularCorrecaoMonetaria(parametros)

  console.log("✅ Resultado do cálculo:")
  console.log(`   Valor corrigido: R$ ${resultado.valorCorrigido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`)
  console.log(`   Fator de correção: ${resultado.fatorCorrecao.toFixed(4)}x`)
  console.log()

  if (resultado.parcelamento) {
    console.log("💰 Resultado do parcelamento:")
    console.log(`   Número de parcelas: ${resultado.parcelamento.numeroParcelas}`)
    console.log(`   Valor de cada parcela: R$ ${resultado.parcelamento.valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`)
    console.log(`   Total (verificação): R$ ${resultado.parcelamento.valorTotalParcelado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`)
    console.log()

    // Validações
    const valorEsperado = 18_198.436
    const tolerancia = 0.01

    const diferenca = Math.abs(resultado.parcelamento.valorParcela - valorEsperado)

    console.log("🔍 Validações:")
    console.log(`   Valor esperado por parcela: R$ ${valorEsperado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`)
    console.log(`   Valor calculado por parcela: R$ ${resultado.parcelamento.valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`)
    console.log(`   Diferença: R$ ${diferenca.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`)
    console.log()

    if (diferenca <= tolerancia) {
      console.log("✨ ✅ TESTE PASSOU! Parcelamento está usando valor corrigido corretamente")
      return true
    } else {
      console.log(`❌ TESTE FALHOU! Diferença maior que tolerância (${tolerancia})`)
      return false
    }
  } else {
    console.log("❌ ERRO: Parcelamento não foi calculado")
    return false
  }
}

const resultado = await testarParcelamento()
process.exit(resultado ? 0 : 1)
