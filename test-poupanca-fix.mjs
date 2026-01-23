import { calcularCorrecaoMonetaria } from './lib/calculo-monetario.ts'

async function testarPoupanca() {
  console.log('🧪 Testando cálculo de Poupança com dados corrigidos...\n')

  const resultado = await calcularCorrecaoMonetaria({
    valorOriginal: 1000,
    dataInicial: { dia: 1, mes: 10, ano: 2025 },
    dataFinal: { dia: 1, mes: 12, ano: 2025 },
    indice: 'Poupança',
    correcaoProRata: false,
  })

  console.log('📄 MEMÓRIA DE CÁLCULO:\n')
  resultado.memoriaCalculo.forEach(linha => console.log(linha))

  console.log('\n✅ Verificações:')
  console.log('1. Contém "Poupança"?', resultado.memoriaCalculo.join('').includes('Poupança') ? '✅' : '❌')
  console.log('2. Outubro 2025 (0.6523%)?', resultado.memoriaCalculo.join('').includes('0.6523') ? '✅' : '❌')
  console.log('3. Novembro 2025 (0.6642%)?', resultado.memoriaCalculo.join('').includes('0.6642') ? '✅' : '❌')
  console.log('4. Dezembro 2025 (0.6751%)?', resultado.memoriaCalculo.join('').includes('0.6751') ? '✅' : '❌')
  console.log('5. Sem aviso de período incompleto?', !resultado.memoriaCalculo.join('').includes('AVISO: Período não contém 12 meses') ? '✅' : '❌')
  console.log('6. Sem parcelamento IGP-M?', resultado.parcelamento === undefined ? '✅' : '❌')
}

testarPoupanca().catch(console.error)
