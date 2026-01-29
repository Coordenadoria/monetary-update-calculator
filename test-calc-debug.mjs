// Índices 2020-2021 do arquivo
const igpm2020 = [0.2588, 0.2588, 0.2446, 0.2162, 0.2162, 0.1733, 0.1303, 0.1303, 0.1159, 0.1159, 0.1159, 0.1159];
const igpm2021 = [0.1159, 0.1159, 0.1159, 0.159, 0.159, 0.2019, 0.2446, 0.2446, 0.3012, 0.3575, 0.4412, 0.4902];

// Valor original
const valorOriginal = 436740.62;

// Calcular acumulado primeiro ciclo (jan-dez 2020)
let fator1 = 1;
for (const taxa of igpm2020) {
  fator1 *= (1 + taxa / 100);
}
console.log('Fator acumulado ciclo 1 (2020):', fator1.toFixed(10));
console.log('IGP-M acumulado ciclo 1:', ((fator1 - 1) * 100).toFixed(4), '%');

const valorAposCiclo1 = valorOriginal * fator1;
console.log('Valor após ciclo 1:', valorAposCiclo1.toFixed(2));

// Parcelas do ciclo 1
const valorParcela1 = valorAposCiclo1 / 24;
console.log('Valor da parcela (12 meses):', valorParcela1.toFixed(2));

// Calcular acumulado segundo ciclo (jan-dez 2021)
let fator2 = 1;
for (const taxa of igpm2021) {
  fator2 *= (1 + taxa / 100);
}
console.log('\nFator acumulado ciclo 2 (2021):', fator2.toFixed(10));
console.log('IGP-M acumulado ciclo 2:', ((fator2 - 1) * 100).toFixed(4), '%');

// Valor após ciclo 2 (aplicado a partir da parcela 13)
const valorAposCiclo2 = valorAposCiclo1 * fator2;
console.log('Valor após ciclo 2:', valorAposCiclo2.toFixed(2));

// Parcela ciclo 2
const valorParcela2 = valorAposCiclo2 / 24;
console.log('Valor da parcela após reajuste (ciclo 2):', valorParcela2.toFixed(2));

// Soma total
const total = (valorParcela1 * 12) + (valorParcela2 * 12);
console.log('\nTotal calculado: R$', total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
console.log('Total (exato):', total.toFixed(10));
