# 🧪 Guia de Teste - Fase Final

## 📋 Checklist de Validação

### 1. ✅ Valores de Poupança (Verificar)
```bash
# Arquivo: lib/indices-data.ts
# Procure por: "Poupança" ou "series 25"
# Confirme que Nov 2025 = 0.6642% e Dez 2025 = 0.6751%
```

### 2. ✅ Valores de IGP-M (Verificar)
```bash
# Arquivo: lib/indices-data.ts linhas 475-488
# Agosto 2025: 0.36%     ✅
# Setembro 2025: 0.42%   ✅
# Outubro 2025: -0.36%   ✅
# Novembro 2025: 0.27%   ✅
# Dezembro 2025: -0.01%  ✅
```

### 3. ✅ Testes de API (Terminal)

#### Test 3A: BCB IGP-M
```bash
curl -s "https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?formato=json" | \
  jq '.[-12:]' | grep -E "(01/(0[1-9]|1[0-2])/2025|valor)"
```
**Resultado esperado:** Últimos 12 meses de 2025 com valores corretos

#### Test 3B: BCB Poupança
```bash
curl -s "https://api.bcb.gov.br/dados/serie/bcdata.sgs.25/dados?formato=json&dataInicial=01/11/2025&dataFinal=31/12/2025" | \
  jq '.[] | select(.data == "01/11/2025" or .data == "01/12/2025")'
```
**Resultado esperado:**
- 01/11/2025: 0.6642
- 01/12/2025: 0.6751

### 4. ✅ Compilação
```bash
cd /workspaces/monetary-update-calculator
npm run build
```
**Resultado esperado:** "✓ Compiled successfully"

### 5. 🖥️ Teste em Navegador (Manual)

#### 5.1 Iniciar Servidor
```bash
npm run dev
# Abre em: http://localhost:3000
```

#### 5.2 Teste de Cálculo com IGP-M
1. Ir para página inicial
2. Fazer cálculo com:
   - Valor: R$ 1.000,00
   - Período: Nov/2025 a Dez/2025
   - Índice: IGP-M
3. **Verificar:**
   - [ ] Memória mostra "Índice utilizado: IGP-M"
   - [ ] Memória mostra TABELA (não lista)
   - [ ] Tabela tem colunas: Mês, Período, Taxa (%), Fator Mensal, Acumulado
   - [ ] Valores estão corretos (Dec 2025 = -0.01%)

#### 5.3 Teste de Cálculo com Poupança
1. Fazer cálculo com:
   - Valor: R$ 1.000,00
   - Período: Nov 01/2025 a Dez 01/2025
   - Índice: Poupança
2. **Verificar:**
   - [ ] Memória mostra "Índice utilizado: Poupança"
   - [ ] Nov 2025: 0.6642%
   - [ ] Dez 2025: 0.6751%

#### 5.4 Teste do Botão "Atualizar do BCB"
1. Ir para página "Gerenciar Índices"
2. Clicar em "Atualizar do BCB"
3. **Verificar:**
   - [ ] Mensagem de sucesso aparece
   - [ ] IGP-M atualizado
   - [ ] Poupança atualizado (✅ NOVO)
   - [ ] Timestamp atualizado para ambos

#### 5.5 Teste de localStorage
1. Abrir DevTools (F12)
2. Ir para "Application" > "Local Storage" > "http://localhost:3000"
3. **Verificar:**
   - [ ] Chave "igpm-indices" existe
   - [ ] Chave "poupanca-indices" existe (✅ NOVO)
   - [ ] Ambas têm timestamp recente
   - [ ] Ambas têm array de dados

---

## 📝 Exemplos de Saída Esperada

### Saída de IGP-M (Tabela)
```
Índice utilizado: IGP-M
IGP-M acumulado (Jan/2025 a Dez/2025): 0.7826%
Fórmula: (1 + m1) × (1 + m2) × ... × (1 + m12) − 1

Detalhamento dos 12 meses (Tabela):

| Mês | Período | Taxa (%) | Fator Mensal | Acumulado |
|-----|---------|----------|--------------|-----------|
| 1 | Jan/2025 | 0.270000 | 1.0027000000 | 0.270000 |
| 2 | Fev/2025 | 1.060000 | 1.0106000000 | 1.333400 |
| 3 | Mar/2025 | -0.340000 | 0.9966000000 | 0.991800 |
| 4 | Abr/2025 | 0.240000 | 1.0024000000 | 1.234400 |
| 5 | Mai/2025 | -0.490000 | 0.9951000000 | 0.742900 |
| 6 | Jun/2025 | -1.670000 | 0.9833000000 | -0.928700 |
| 7 | Jul/2025 | -0.770000 | 0.9923000000 | -1.699000 |
| 8 | Ago/2025 | 0.360000 | 1.0036000000 | -1.339400 |
| 9 | Set/2025 | 0.420000 | 1.0042000000 | -0.913100 |
| 10 | Out/2025 | -0.360000 | 0.9964000000 | -1.277500 |
| 11 | Nov/2025 | 0.270000 | 1.0027000000 | -1.004300 |
| 12 | Dez/2025 | -0.010000 | 0.9999000000 | -1.014900 |

Reajuste: R$ 1.000,00 × 1.0076 = R$ 1.007,60
Ganho: R$ 7,60
```
✅ Formato esperado

### Saída de Poupança
```
Índice utilizado: Poupança
Poupança (01/11/2025): 0.6642%
Fator: 1.006642
Reajuste: R$ 1.000,00 × 1.006642 = R$ 1.006,64
Ganho: R$ 6,64
```
✅ Formato esperado

---

## 🔍 Troubleshooting

### Problema: Compilação falha
**Solução:**
```bash
npm install  # Reinstalar dependências
npm run build  # Tentar novamente
```

### Problema: API BCB não responde
**Solução:**
```bash
# Testar conectividade
curl -I https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?formato=json
# Deve retornar: HTTP/1.1 200 OK

# Se falhar, sistema usa fallback Ipeadata
```

### Problema: Memória não mostra tabela
**Verificar:**
1. Arquivo `lib/calculo-monetario.ts` linhas 1037-1060
2. Procure por `| Mês | Período |` - deve estar presente
3. Se ausente, rodou o `npm run build` após editar?

### Problema: Valores incorretos de Poupança
**Verificar:**
1. localStorage foi limpo? (DevTools > Application > Clear)
2. Clicar em "Atualizar do BCB" para refrescar
3. Arquivo `lib/indices-data.ts` tem 0.6642 e 0.6751?

---

## ✅ Checklist Final de Implementação

### Código
- [ ] `lib/indices-data.ts` - IGP-M 2025 com valores corretos
- [ ] `lib/fetch-indices.ts` - BCB APIs implementadas
- [ ] `lib/calculo-monetario.ts` - Tabela formatada
- [ ] Compilação sem erros
- [ ] Build bem-sucedido

### Funcionalidades
- [ ] Cálculo com IGP-M funciona
- [ ] Cálculo com Poupança funciona
- [ ] Memória mostra nome do índice
- [ ] Memória mostra tabela profissional
- [ ] Botão "Atualizar do BCB" atualiza ambos

### APIs
- [ ] BCB IGP-M retorna dados corretos
- [ ] BCB Poupança retorna dados corretos
- [ ] Fallback Ipeadata ativo para IGP-M
- [ ] localStorage cacheando ambos

### Testes
- [ ] Testes API passam
- [ ] Build compila
- [ ] Navegador carrega página
- [ ] Cálculos funcionam
- [ ] Atualização BCB funciona

---

## 🎯 Resumo de Testes

**Tempo Estimado:** 15-20 minutos
**Complexidade:** Média

**Testes Obrigatórios:**
1. ✅ Compilação
2. ✅ API BCB (curl)
3. ✅ Valor IGP-M Dez 2025 = -0.01%
4. ✅ Valor Poupança Nov 2025 = 0.6642%
5. ✅ Tabela exibe corretamente
6. ✅ Nome do índice exibe

**Resultado:** Se todos forem ✅, implementação está 100% completa!
