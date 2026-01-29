// Se a parcela 1 é 18.198,44 e dividida por 24 do valor corrigido
// Então: valorCorrigido / 24 = 18.198,44
const valorParcela = 18198.44;
const numeroParcelas = 24;
const valorCorrigido = valorParcela * numeroParcelas;
console.log('Valor corrigido (inferido):', valorCorrigido.toFixed(2));

// Se valor original * fator1 = valor corrigido
// E fator1 = 1.0211207299
const fator1 = 1.0211207299;
const valorOriginal = valorCorrigido / fator1;
console.log('Valor original (inferido):', valorOriginal.toFixed(2));

// Mas espera, se a parcela 1 é 18.198,44 e a parcela 13 é 18.196,62
// Esses valores são MUITO próximos - isso é estranho
// Se fosse aplicado reajuste de 2.986%, esperaríamos:
// 18.198,44 * 1.02986 = 18.742,45 (bem diferente)

// Talvez os valores mostrados sejam com outra lógica...
// Deixa eu tentar: se valor corrigido / 24 = parcela base
const valorParcelaBase = 18198.44;
const valorCorrigidoTest = valorParcelaBase * 24;
console.log('\nSe parcela é 18.198,44:');
console.log('Valor corrigido seria:', valorCorrigidoTest.toFixed(2));

// E a segunda parcela 18.196,62 * 24 = ?
const valorParcela2 = 18196.62;
const valorCorrigidoTest2 = valorParcela2 * 24;
console.log('\nSe parcela ciclo 2 é 18.196,62:');
console.log('Valor corrigido seria:', valorCorrigidoTest2.toFixed(2));

// Espera, essas parcelas são quase iguais...
console.log('\nDiferença entre parcelas:', (valorParcela - valorParcela2).toFixed(2));

// Isso só faria sentido se o reajuste fosse NEGATIVO ou praticamente zero
// Deixa eu verificar: qual seria o reajuste?
const reajuste = (valorParcela2 / valorParcela - 1) * 100;
console.log('Reajuste implícito:', reajuste.toFixed(4), '%');
