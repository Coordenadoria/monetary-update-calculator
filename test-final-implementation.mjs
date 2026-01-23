import fetch from 'node-fetch'

console.log('🔍 Testando implementação final...\n')

// Test 1: BCB IGP-M API
console.log('1️⃣  Testando BCB IGP-M (série 189):')
try {
  const response = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?formato=json')
  const data = await response.json()
  const last12 = data.slice(-12)
  console.log(`✅ API respondeu com ${data.length} registros`)
  console.log('   Últimos 12 meses (2025):')
  last12.forEach(d => {
    const [day, month, year] = d.data.split('/')
    console.log(`   ${month}/${year}: ${d.valor}%`)
  })
} catch (e) {
  console.log(`❌ Erro: ${e.message}`)
}

console.log('\n2️⃣  Testando BCB Poupança (série 25):')
try {
  const response = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.25/dados?formato=json&dataInicial=01/11/2025&dataFinal=31/12/2025')
  const data = await response.json()
  console.log(`✅ API respondeu com ${data.length} registros`)
  console.log('   Valores por períodos:')
  const novValues = data.filter(d => d.data.startsWith('01/11') || d.data.startsWith('24/11')).slice(0, 2)
  const decValues = data.filter(d => d.data.startsWith('01/12') || d.data.startsWith('28/12')).slice(0, 2)
  console.log(`   Nov 01: ${novValues[0]?.valor}% (deve ser ~0.6642%)`)
  console.log(`   Dec 01: ${decValues[0]?.valor}% (deve ser ~0.6751%)`)
} catch (e) {
  console.log(`❌ Erro: ${e.message}`)
}

console.log('\n3️⃣  Validando indices-data.ts IGP-M 2025:')
import('./lib/indices-data.ts').then(module => {
  const data = module.default || module.indicesData
  if (data?.IGP_M) {
    const igpm2025 = data.IGP_M.filter(d => d.ano === 2025)
    console.log(`✅ Encontrados ${igpm2025.length} meses de 2025`)
    igpm2025.forEach(d => {
      const meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      console.log(`   ${meses[d.mes]}/2025: ${d.valor}%`)
    })
  }
}).catch(e => console.log(`⚠️  Não foi possível importar (normal - TypeScript)`))

console.log('\n✅ Testes concluídos!')
