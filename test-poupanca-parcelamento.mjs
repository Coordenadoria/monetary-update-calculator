import { calcularCorrecaoMonetaria } from './lib/calculo-monetario.ts';

// Test Poupança with parcelamento
const parametros = {
  valorOriginal: 1000,
  dataInicio: { dia: 1, mes: 1, ano: 2020 },
  dataFinal: { dia: 31, mes: 12, ano: 2025 },
  nomeIndice: "Poupança",
  numeroParcelas: 12
};

console.log("Testing Poupança with 12 parcelas...");
try {
  const resultado = await calcularCorrecaoMonetaria(parametros);
  console.log("✓ Success!");
  console.log("Valor corrigido:", resultado.valorCorrigido);
  console.log("Parcelamento:", resultado.parcelamento);
  console.log("Memory length:", resultado.memoriaCalculo.length, "lines");
} catch (error) {
  console.error("✗ Error:", error.message);
}
