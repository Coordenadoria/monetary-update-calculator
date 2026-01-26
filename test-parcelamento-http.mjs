#!/usr/bin/env node

/**
 * TEST: Validar que parcelamento usa valor CORRIGIDO
 * Teste via API HTTP
 */

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

  try {
    const response = await fetch("http://localhost:3000/api/calcular-correcao", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parametros),
    })

    if (!response.ok) {
      console.error(`❌ Erro HTTP: ${response.status}`)
      return false
    }

    const resultado = await response.json()

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
        console.log(`⚠️  TESTE: Diferença de R$ ${diferenca.toFixed(2)} (tolerância: R$ ${tolerancia.toFixed(2)})`)
        console.log(`   Valor correto detectado: ${Math.abs(diferenca) < 1 ? "SIM ✅" : "NÃO ❌"}`)
        return Math.abs(diferenca) < 1
      }
    } else {
      console.log("❌ ERRO: Parcelamento não foi calculado")
      return false
    }
  } catch (erro) {
    console.error(`❌ Erro de conexão: ${erro.message}`)
    return false
  }
}

const resultado = await testarParcelamento()
process.exit(resultado ? 0 : 1)
