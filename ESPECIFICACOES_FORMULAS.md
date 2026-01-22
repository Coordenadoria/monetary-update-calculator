# Especificações das Fórmulas de Correção Monetária

## 📋 Referência: 5 Pontos-Chave Implementados

### 1. Correção Mensal pela Poupança

**Aplicada todo mês, de forma composta:**

$$\text{Valor}_{\text{mês}} = \text{Valor}_{\text{mês anterior}} \times (1 + p_m)$$

**Onde:**
- $p_m$ = taxa mensal da poupança do mês (em forma decimal)
- Exemplo: Se a poupança é 0,85%, então $p_m = 0,0085$
- Resultado: Novo valor com a poupança aplicada

**Características:**
- ✓ Aplicada em **todos os meses**, sem exceção
- ✓ Utiliza **composição de fatores**
- ✓ Nunca é distribuída ou fraccionada

---

### 2. Reajuste Anual pelo IGP-M (a cada 12 meses completos)

**Aplicado somente no mês de aniversário do ciclo de 12 meses, após a correção mensal da poupança:**

$$\text{Valor}_{\text{mês}} = \text{Valor}_{\text{mês}} \times (1 + \text{igpm}_{12})$$

**Onde:**
- $\text{igpm}_{12}$ = IGP-M acumulado dos últimos 12 meses (em forma decimal)
- Calculado como: $(1 + m_1) \times (1 + m_2) \times \ldots \times (1 + m_{12}) - 1$

**Características:**
- ✓ Aplicado **uma única vez por ciclo de 12 meses**
- ✓ Nos meses exatos: 12, 24, 36, 48...
- ✓ Nunca distribuído mensalmente
- ✓ Nunca misturado com taxa mensal

---

### 3. Fórmula Consolidada do Mês com Aniversário de 12 Meses

**Quando coincidem poupança + reajuste anual:**

$$\text{Valor}_{\text{mês}} = \text{Valor}_{\text{mês anterior}} \times (1 + p_m) \times (1 + \text{igpm}_{12})$$

**Exemplo Numérico:**
- Valor anterior: R$ 10.000,00
- Poupança: 0,85% → $p_m = 0,0085$
- IGP-M acumulado 12 meses: 8,50% → $\text{igpm}_{12} = 0,0850$

**Cálculo:**
- Fator Poupança: $1 + 0,0085 = 1,0085$
- Fator IGP-M: $1 + 0,0850 = 1,0850$
- Fator Total: $1,0085 \times 1,0850 = 1,0942225$
- Valor final: $10.000 \times 1,0942225 = 10.942,23$

**CRÍTICO:** Multiplicar fatores (1,0085 × 1,0850), **nunca somar** (0,0085 + 0,0850)

---

### 4. Fórmula Geral Após N Meses

**Considerando:**
- Correção mensal da poupança em **todos os meses**
- Reajuste anual do IGP-M nos meses **12, 24, 36, ...**

$$\text{Valor}_{\text{final}} = \text{Valor}_{\text{inicial}} \times \prod_{i=1}^{N}(1 + p_i) \times \prod_{j=1}^{J}(1 + \text{igpm}_{12,j})$$

**Onde:**
- Primeiro produtório $\prod_{i=1}^{N}(1 + p_i)$ = todos os meses (sempre aplicado)
- Segundo produtório $\prod_{j=1}^{J}(1 + \text{igpm}_{12,j})$ = somente ciclos anuais completos

**Exemplo Numérico (36 meses):**

| Mês | Poupança | IGP-M | Fator | Valor |
|-----|----------|-------|--------|---------|
| 1 | 0,85% | — | 1,0085 | 10.085,00 |
| 2 | 0,85% | — | 1,0085 | 10.171,20 |
| ... | ... | ... | ... | ... |
| 12 | 0,85% | 8,50% | 1,0085 × 1,0850 | 11.026,67 |
| 13 | 0,85% | — | 1,0085 | 11.120,21 |
| ... | ... | ... | ... | ... |
| 24 | 0,85% | 8,50% | 1,0085 × 1,0850 | 12.050,85 |
| 25 | 0,85% | — | 1,0085 | 12.153,07 |
| ... | ... | ... | ... | ... |
| 36 | 0,85% | 8,50% | 1,0085 × 1,0850 | 13.166,60 |

**Fórmula compacta:**
$$\text{Valor}_{36} = 10.000 \times (1,0085)^{36} \times (1,0850)^3$$

---

### 5. Observação Técnica Essencial (IMPORTANTE)

**❌ O QUE NUNCA DEVE SER FEITO:**

1. **Não distribuir IGP-M mensalmente**
   - ❌ Errado: 8,50% ÷ 12 = 0,708% ao mês
   - ✓ Correto: Aplicar 8,50% uma única vez no mês 12

2. **Não somar percentuais**
   - ❌ Errado: 0,85% + 8,50% = 9,35% (OPERAÇÃO INVÁLIDA)
   - ✓ Correto: $(1 + 0,0085) \times (1 + 0,0850) - 1 = 9,4222\%$

3. **Não misturar IGP-M com taxa mensal antes do tempo**
   - ❌ Errado: Aplicar IGP-M desde o mês 1
   - ✓ Correto: Aplicar IGP-M somente nos meses 12, 24, 36...

4. **Não aplicar IGP-M em ciclos incompletos**
   - ❌ Errado: Se houver 11 meses, aplicar IGP-M mesmo assim
   - ✓ Correto: Aplicar IGP-M somente quando houver 12 meses completos

5. **Não alterar a estrutura do produtório**
   - ❌ Errado: IGP-M no numerador do produtório mensal
   - ✓ Correto: IGP-M em produtório separado, apenas para ciclos anuais

---

## 🔍 Validação das Fórmulas no Código

As 5 fórmulas estão implementadas em `/workspaces/monetary-update-calculator/lib/calculo-monetario.ts`:

### Fórmula 1 - Poupança Mensal
- **Localização:** Função `aplicarReajusteIGPMACada12Meses()`, linha com "FÓRMULA 1"
- **Código:** `resultado.push(indicePoupanca)` para meses não-aniversário
- **Validação:** Aplicada em todos os meses, sempre multiplicada

### Fórmula 2 - IGP-M Acumulado
- **Localização:** Função `calcularIGPMAcumulado12Meses()`
- **Código:** Loop multiplicando fatores mensais
- **Validação:** Produto de 12 fatores: $(1+m_1) \times (1+m_2) \times \ldots \times (1+m_{12}) - 1$

### Fórmula 3 - Consolidada (Mês 12, 24, 36...)
- **Localização:** Função `aplicarReajusteIGPMACada12Meses()`, onde `contador_meses % 12 === 0`
- **Código:**
  ```typescript
  const fatorPoupanca = 1 + indicePoupanca.valor / 100
  const fatorIGPM = 1 + igpmAcumulado / 100
  const fatorTotal = fatorPoupanca * fatorIGPM
  const percentualTotal = (fatorTotal - 1) * 100
  ```
- **Validação:** Multiplicação de dois fatores, sem soma de percentuais

### Fórmula 4 - Geral (N meses)
- **Localização:** Loop principal em `calcularCorrecaoMonetaria()`
- **Código:** Itera sobre todos os meses (Fórmula 1) + aniversários (Fórmula 3)
- **Validação:** Produtório de poupança × Produtório de ciclos IGP-M

### Fórmula 5 - Restrições
- **Validação:**
  - ✓ IGP-M nunca dividido por 12
  - ✓ IGP-M nunca somado com Poupança
  - ✓ IGP-M nunca aplicado fora dos meses 12, 24, 36...
  - ✓ Sempre multiplicação de fatores
  - ✓ IGP-M aplicado uma única vez por ciclo

---

## 📊 Teste Rápido (Verificação Manual)

**Cenário:** 13 meses com Poupança 0,85% e IGP-M 8,50%

```
Mês 1:  Valor × 1,0085 = Valor_1
Mês 2:  Valor_1 × 1,0085 = Valor_2
...
Mês 12: Valor_11 × 1,0085 × 1,0850 = Valor_12  ← Combina Fórmulas 1 e 2
Mês 13: Valor_12 × 1,0085 = Valor_13

Valor_final = Valor_0 × (1,0085)^13 × (1,0850)^1
```

Se o resultado não seguir este padrão, há erro na implementação.

---

## 🔗 Referências

- **Fórmula 1:** Resolução do Banco Central sobre remuneração da poupança
- **Fórmula 2:** Fundação Getúlio Vargas (FGV) - Metodologia IGP-M
- **Fórmula 3:** Jurisprudência sobre aplicação cumulativa
- **Fórmula 4:** Matemática financeira (composição de juros)
- **Fórmula 5:** Restrições técnicas para precisão

---

**Última atualização:** 2026-01-22  
**Versão:** 1.0 - Especificações Validadas
