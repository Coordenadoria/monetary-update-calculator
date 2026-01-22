#!/bin/bash

# Script de Teste - Calculadora de Atualização Monetária
# Testa as funcionalidades implementadas

echo "========================================"
echo "TESTE DE IMPLEMENTAÇÃO"
echo "========================================"
echo ""

# Teste 1: Verificar se o servidor está rodando
echo "Teste 1: Verificando se servidor está rodando..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✓ Servidor está rodando na porta 3000"
else
    echo "✗ Servidor NÃO está respondendo"
    echo "Execute: npm run dev"
    exit 1
fi
echo ""

# Teste 2: Testar endpoint de atualização de índices
echo "Teste 2: Testando atualização de índices..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/atualizar-indices \
  -H "Content-Type: application/json" \
  -d '{}')

echo "Resposta da API:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Verificar se há índices retornados
if echo "$RESPONSE" | grep -q "success"; then
    echo "✓ API respondeu corretamente"
else
    echo "✗ Erro na resposta da API"
fi
echo ""

echo "========================================"
echo "TESTES COMPLETADOS"
echo "========================================"
echo ""
echo "Próximas etapas:"
echo "1. Acesse http://localhost:3000 no navegador"
echo "2. Preencha o formulário com:"
echo "   - Valor: 10000.00"
echo "   - Data inicial: 01/01/2020"
echo "   - Data final: 31/12/2021"
echo "   - Índice: IGP-M (FGV)"
echo "3. Execute o cálculo"
echo "4. Verifique a memória de cálculo para confirmar:"
echo "   - Seção 'REGRA DE REAJUSTE A CADA 12 MESES'"
echo "   - Fórmula: IGP-M acumulado = (1 + m1) × (1 + m2) × ... × (1 + m12) − 1"
echo "   - Detalhamento com reajustes entre ciclos"
echo ""
