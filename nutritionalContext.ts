
// ARQUIVO: nutritionalContext.ts
// BASE DE CONHECIMENTO DEDICADA PARA CÁLCULO E CONFERÊNCIA DE TABELAS NUTRICIONAIS

const VDR_DATA = {
  "anexo_ii": {
    "descricao": "VDR para fins de rotulagem nutricional dos alimentos em geral (RDC 429/2020, Anexo II).",
    "vdr_referencia": {
      "valor_energetico": { "nome": "Valor energético", "valor": 2000, "unidade": "kcal" },
      "carboidratos": { "nome": "Carboidratos", "valor": 300, "unidade": "g" },
      "acucares_adicionados": { "nome": "Açúcares adicionados", "valor": 50, "unidade": "g" },
      "proteinas": { "nome": "Proteínas", "valor": 50, "unidade": "g" },
      "gorduras_totais": { "nome": "Gorduras totais", "valor": 65, "unidade": "g" },
      "gorduras_saturadas": { "nome": "Gorduras saturadas", "valor": 20, "unidade": "g" },
      "gorduras_trans": { "nome": "Gorduras trans", "valor": 2, "unidade": "g" },
      "gorduras_monoinstauradas": { "nome": "Gorduras monoinsaturadas", "valor": 20, "unidade": "g" },
      "gorduras_poliinstauradas": { "nome": "Gorduras poli-insaturadas", "valor": 20, "unidade": "g" },
      "omega_6": { "nome": "Ômega 6", "valor": 18, "unidade": "g" },
      "omega_3": { "nome": "Ômega 3", "valor": 4000, "unidade": "mg" },
      "colesterol": { "nome": "Colesterol", "valor": 300, "unidade": "mg" },
      "fibras_alimentares": { "nome": "Fibras alimentares", "valor": 25, "unidade": "g" },
      "sodio": { "nome": "Sódio", "valor": 2000, "unidade": "mg" },
      "vitamina_a": { "nome": "Vitamina A", "valor": 800, "unidade": "mg de RAE" },
      "vitamina_d": { "nome": "Vitamina D", "valor": 15, "unidade": "mg" },
      "vitamina_e": { "nome": "Vitamina E", "valor": 15, "unidade": "mg" },
      "vitamina_k": { "nome": "Vitamina K", "valor": 120, "unidade": "mg" },
      "vitamina_c": { "nome": "Vitamina C", "valor": 100, "unidade": "mg" },
      "tiamina": { "nome": "Tiamina", "valor": 1.2, "unidade": "mg" },
      "riboflavina": { "nome": "Riboflavina", "valor": 1.2, "unidade": "mg" },
      "niacina": { "nome": "Niacina", "valor": 15, "unidade": "mg de NE" },
      "vitamina_b6": { "nome": "Vitamina B6", "valor": 1.3, "unidade": "mg" },
      "biotina": { "nome": "Biotina", "valor": 30, "unidade": "mg" },
      "acido_folico": { "nome": "Ácido fólico", "valor": 400, "unidade": "mg de DFE" },
      "acido_pantotenico": { "nome": "Ácido pantotênico", "valor": 5, "unidade": "mg" },
      "vitamina_b12": { "nome": "Vitamina B12", "valor": 2.4, "unidade": "mg" },
      "calcio": { "nome": "Cálcio", "valor": 1000, "unidade": "mg" },
      "cloreto": { "nome": "Cloreto", "valor": 2300, "unidade": "mg" },
      "cobre": { "nome": "Cobre", "valor": 900, "unidade": "mg" },
      "cromo": { "nome": "Cromo", "valor": 35, "unidade": "mg" },
      "ferro": { "nome": "Ferro", "valor": 14, "unidade": "mg" },
      "fluor": { "nome": "Flúor", "valor": 4, "unidade": "mg" },
      "fosforo": { "nome": "Fósforo", "valor": 700, "unidade": "mg" },
      "iodo": { "nome": "Iodo", "valor": 150, "unidade": "mg" },
      "magnesio": { "nome": "Magnésio", "valor": 420, "unidade": "mg" },
      "manganes": { "nome": "Manganês", "valor": 3, "unidade": "mg" },
      "molibdenio": { "nome": "Molibdênio", "valor": 45, "unidade": "mg" },
      "potassio": { "nome": "Potássio", "valor": 3500, "unidade": "mg" },
      "selenio": { "nome": "Selênio", "valor": 60, "unidade": "mg" },
      "zinco": { "nome": "Zinco", "valor": 11, "unidade": "mg" },
      "colina": { "nome": "Colina", "valor": 550, "unidade": "mg" }
    }
  },
  "anexo_viii": {
    "descricao": "VDR para fins de rotulagem nutricional dos alimentos para fins especiais e suplementos alimentares (RDC 429/2020, Anexo VIII).",
    "grupos_populacionais": {
      "0_6_meses": "0 a 6 meses",
      "7_11_meses": "7 a 11 meses",
      "1_3_anos": "1 a 3 anos",
      "4_8_anos": "4 a 8 anos",
      "9_18_anos": "9 a 18 anos",
      "maior_igual_19_anos": "≥ 19 anos",
      "gestantes": "Gestantes",
      "lactantes": "Lactantes"
    },
    "vdr_por_nutriente": {
      "valor_energetico": {
        "nome": "Valor energético",
        "unidade": "kcal",
        "valores": { "0_6_meses": 550, "7_11_meses": 700, "1_3_anos": 1000, "4_8_anos": 1500, "9_18_anos": 2500, "maior_igual_19_anos": 2000, "gestantes": 2300, "lactantes": 2600 }
      },
      "carboidratos": {
        "nome": "Carboidratos",
        "unidade": "g",
        "valores": { "0_6_meses": 60, "7_11_meses": 95, "1_3_anos": 150, "4_8_anos": 225, "9_18_anos": 375, "maior_igual_19_anos": 300, "gestantes": 345, "lactantes": 360 }
      },
      "acucares_adicionados": {
        "nome": "Açúcares adicionados",
        "unidade": "g",
        "valores": { "0_6_meses": null, "7_11_meses": null, "1_3_anos": 25, "4_8_anos": 35, "9_18_anos": 60, "maior_igual_19_anos": 50, "gestantes": 55, "lactantes": 65 }
      },
      "proteinas": {
        "nome": "Proteínas",
        "unidade": "g",
        "valores": { "0_6_meses": 9, "7_11_meses": 11, "1_3_anos": 25, "4_8_anos": 35, "9_18_anos": 60, "maior_igual_19_anos": 50, "gestantes": 55, "lactantes": 65 }
      },
      "gorduras_totais": {
        "nome": "Gorduras totais",
        "unidade": "g",
        "valores": { "0_6_meses": 30, "7_11_meses": 27, "1_3_anos": 33, "4_8_anos": 50, "9_18_anos": 80, "maior_igual_19_anos": 65, "gestantes": 75, "lactantes": 85 }
      },
      "gorduras_saturadas": {
        "nome": "Gorduras saturadas",
        "unidade": "g",
        "valores": { "0_6_meses": null, "7_11_meses": null, "1_3_anos": 11, "4_8_anos": 16, "9_18_anos": 27, "maior_igual_19_anos": 20, "gestantes": 25, "lactantes": 28 }
      },
      "gorduras_trans": {
        "nome": "Gorduras trans",
        "unidade": "g",
        "valores": { "0_6_meses": null, "7_11_meses": null, "1_3_anos": 1, "4_8_anos": 1.5, "9_18_anos": 2.5, "maior_igual_19_anos": 2, "gestantes": 2.5, "lactantes": 2.5 }
      },
      "gorduras_monoinstauradas": {
        "nome": "Gorduras monoinsaturadas",
        "unidade": "g",
        "valores": { "0_6_meses": null, "7_11_meses": null, "1_3_anos": 11, "4_8_anos": 16, "9_18_anos": 27, "maior_igual_19_anos": 20, "gestantes": 25, "lactantes": 28 }
      },
      "gorduras_poliinstauradas": {
        "nome": "Gorduras poli-insaturadas",
        "unidade": "g",
        "valores": { "0_6_meses": null, "7_11_meses": null, "1_3_anos": 11, "4_8_anos": 16, "9_18_anos": 27, "maior_igual_19_anos": 20, "gestantes": 25, "lactantes": 28 }
      },
      "omega_6": {
        "nome": "Ômega 6",
        "unidade": "g",
        "valores": { "0_6_meses": null, "7_11_meses": null, "1_3_anos": 9, "4_8_anos": 13, "9_18_anos": 22, "maior_igual_19_anos": 18, "gestantes": 20, "lactantes": 23 }
      },
      "omega_3": {
        "nome": "Ômega 3",
        "unidade": "mg",
        "valores": { "0_6_meses": null, "7_11_meses": null, "1_3_anos": 2000, "4_8_anos": 3000, "9_18_anos": 5000, "maior_igual_19_anos": 4000, "gestantes": 5000, "lactantes": 5000 }
      },
      "colesterol": {
        "nome": "Colesterol",
        "unidade": "mg",
        "valores": { "0_6_meses": null, "7_11_meses": null, "1_3_anos": 300, "4_8_anos": 300, "9_18_anos": 300, "maior_igual_19_anos": 300, "gestantes": 300, "lactantes": 300 }
      },
      "fibras_alimentares": {
        "nome": "Fibras alimentares",
        "unidade": "g",
        "valores": { "0_6_meses": null, "7_11_meses": null, "1_3_anos": 19, "4_8_anos": 25, "9_18_anos": 38, "maior_igual_19_anos": 25, "gestantes": 28, "lactantes": 29 }
      },
      "sodio": {
        "nome": "Sódio",
        "unidade": "mg",
        "valores": { "0_6_meses": 120, "7_11_meses": 370, "1_3_anos": 1000, "4_8_anos": 2000, "9_18_anos": 2000, "maior_igual_19_anos": 2000, "gestantes": 2000, "lactantes": 2000 }
      },
      "vitamina_a": {
        "nome": "Vitamina A",
        "unidade": "mg de RAE",
        "valores": { "0_6_meses": 400, "7_11_meses": 500, "1_3_anos": 300, "4_8_anos": 400, "9_18_anos": 900, "maior_igual_19_anos": 800, "gestantes": 770, "lactantes": 1300 }
      },
      "vitamina_d": {
        "nome": "Vitamina D",
        "unidade": "mg",
        "valores": { "0_6_meses": 10, "7_11_meses": 10, "1_3_anos": 15, "4_8_anos": 15, "9_18_anos": 15, "maior_igual_19_anos": 15, "gestantes": 15, "lactantes": 15 }
      },
      "vitamina_e": {
        "nome": "Vitamina E",
        "unidade": "mg",
        "valores": { "0_6_meses": 4, "7_11_meses": 5, "1_3_anos": 6, "4_8_anos": 7, "9_18_anos": 15, "maior_igual_19_anos": 15, "gestantes": 15, "lactantes": 15 }
      },
      "vitamina_k": {
        "nome": "Vitamina K",
        "unidade": "mg",
        "valores": { "0_6_meses": 2, "7_11_meses": 2.5, "1_3_anos": 30, "4_8_anos": 55, "9_18_anos": 75, "maior_igual_19_anos": 120, "gestantes": 90, "lactantes": 90 }
      },
      "vitamina_c": {
        "nome": "Vitamina C",
        "unidade": "mg",
        "valores": { "0_6_meses": 40, "7_11_meses": 50, "1_3_anos": 15, "4_8_anos": 25, "9_18_anos": 75, "maior_igual_19_anos": 100, "gestantes": 85, "lactantes": 120 }
      },
      "tiamina": {
        "nome": "Tiamina",
        "unidade": "mg",
        "valores": { "0_6_meses": 0.2, "7_11_meses": 0.3, "1_3_anos": 0.5, "4_8_anos": 0.6, "9_18_anos": 1.2, "maior_igual_19_anos": 1.2, "gestantes": 1.4, "lactantes": 1.4 }
      },
      "riboflavina": {
        "nome": "Riboflavina",
        "unidade": "mg",
        "valores": { "0_6_meses": 0.3, "7_11_meses": 0.4, "1_3_anos": 0.5, "4_8_anos": 0.6, "9_18_anos": 1.3, "maior_igual_19_anos": 1.2, "gestantes": 1.4, "lactantes": 1.6 }
      },
      "niacina": {
        "nome": "Niacina",
        "unidade": "mg de NE",
        "valores": { "0_6_meses": 2, "7_11_meses": 4, "1_3_anos": 6, "4_8_anos": 8, "9_18_anos": 16, "maior_igual_19_anos": 15, "gestantes": 18, "lactantes": 17 }
      },
      "vitamina_b6": {
        "nome": "Vitamina B6",
        "unidade": "mg",
        "valores": { "0_6_meses": 0.1, "7_11_meses": 0.3, "1_3_anos": 0.5, "4_8_anos": 0.6, "9_18_anos": 1.3, "maior_igual_19_anos": 1.3, "gestantes": 1.9, "lactantes": 2 }
      },
      "biotina": {
        "nome": "Biotina",
        "unidade": "mg",
        "valores": { "0_6_meses": 5, "7_11_meses": 6, "1_3_anos": 8, "4_8_anos": 12, "9_18_anos": 25, "maior_igual_19_anos": 30, "gestantes": 30, "lactantes": 35 }
      },
      "acido_folico": {
        "nome": "Ácido fólico",
        "unidade": "mg de DFE",
        "valores": { "0_6_meses": 65, "7_11_meses": 80, "1_3_anos": 150, "4_8_anos": 200, "9_18_anos": 400, "maior_igual_19_anos": 400, "gestantes": 600, "lactantes": 500 }
      },
      "acido_pantotenico": {
        "nome": "Ácido pantotênico",
        "unidade": "mg",
        "valores": { "0_6_meses": 1.7, "7_11_meses": 1.8, "1_3_anos": 2, "4_8_anos": 3, "9_18_anos": 5, "maior_igual_19_anos": 5, "gestantes": 6, "lactantes": 7 }
      },
      "vitamina_b12": {
        "nome": "Vitamina B12",
        "unidade": "mg",
        "valores": { "0_6_meses": 0.4, "7_11_meses": 0.5, "1_3_anos": 0.9, "4_8_anos": 1.2, "9_18_anos": 2.4, "maior_igual_19_anos": 2.4, "gestantes": 2.6, "lactantes": 2.8 }
      },
      "calcio": {
        "nome": "Cálcio",
        "unidade": "mg",
        "valores": { "0_6_meses": 200, "7_11_meses": 260, "1_3_anos": 700, "4_8_anos": 1000, "9_18_anos": 1300, "maior_igual_19_anos": 1000, "gestantes": 1300, "lactantes": 1300 }
      },
      "cloreto": {
        "nome": "Cloreto",
        "unidade": "mg",
        "valores": { "0_6_meses": 180, "7_11_meses": 570, "1_3_anos": 1500, "4_8_anos": 1900, "9_18_anos": 2300, "maior_igual_19_anos": 2300, "gestantes": 2300, "lactantes": 2300 }
      },
      "cobre": {
        "nome": "Cobre",
        "unidade": "mg",
        "valores": { "0_6_meses": 200, "7_11_meses": 220, "1_3_anos": 340, "4_8_anos": 440, "9_18_anos": 890, "maior_igual_19_anos": 900, "gestantes": 1000, "lactantes": 1300 }
      },
      "cromo": {
        "nome": "Cromo",
        "unidade": "mg",
        "valores": { "0_6_meses": 0.2, "7_11_meses": 5.5, "1_3_anos": 11, "4_8_anos": 15, "9_18_anos": 35, "maior_igual_19_anos": 35, "gestantes": 30, "lactantes": 45 }
      },
      "ferro": {
        "nome": "Ferro",
        "unidade": "mg",
        "valores": { "0_6_meses": 0.27, "7_11_meses": 11, "1_3_anos": 7, "4_8_anos": 10, "9_18_anos": 15, "maior_igual_19_anos": 14, "gestantes": 27, "lactantes": 10 }
      },
      "fluor": {
        "nome": "Flúor",
        "unidade": "mg",
        "valores": { "0_6_meses": 0.01, "7_11_meses": 0.5, "1_3_anos": 0.7, "4_8_anos": 1, "9_18_anos": 3, "maior_igual_19_anos": 4, "gestantes": 3, "lactantes": 3 }
      },
      "fosforo": {
        "nome": "Fósforo",
        "unidade": "mg",
        "valores": { "0_6_meses": 100, "7_11_meses": 275, "1_3_anos": 460, "4_8_anos": 500, "9_18_anos": 1250, "maior_igual_19_anos": 700, "gestantes": 1250, "lactantes": 1250 }
      },
      "iodo": {
        "nome": "Iodo",
        "unidade": "mg",
        "valores": { "0_6_meses": 110, "7_11_meses": 130, "1_3_anos": 90, "4_8_anos": 90, "9_18_anos": 150, "maior_igual_19_anos": 150, "gestantes": 220, "lactantes": 290 }
      },
      "magnesio": {
        "nome": "Magnésio",
        "unidade": "mg",
        "valores": { "0_6_meses": 30, "7_11_meses": 75, "1_3_anos": 80, "4_8_anos": 130, "9_18_anos": 410, "maior_igual_19_anos": 420, "gestantes": 400, "lactantes": 360 }
      },
      "manganes": {
        "nome": "Manganês",
        "unidade": "mg",
        "valores": { "0_6_meses": 0.003, "7_11_meses": 0.6, "1_3_anos": 1.2, "4_8_anos": 1.5, "9_18_anos": 2.2, "maior_igual_19_anos": 3, "gestantes": 2, "lactantes": 2.6 }
      },
      "molibdenio": {
        "nome": "Molibdênio",
        "unidade": "mg",
        "valores": { "0_6_meses": 2, "7_11_meses": 3, "1_3_anos": 17, "4_8_anos": 22, "9_18_anos": 43, "maior_igual_19_anos": 45, "gestantes": 5, "lactantes": 50 }
      },
      "potassio": {
        "nome": "Potássio",
        "unidade": "mg",
        "valores": { "0_6_meses": 400, "7_11_meses": 700, "1_3_anos": 3000, "4_8_anos": 3500, "9_18_anos": 3500, "maior_igual_19_anos": 3500, "gestantes": 3500, "lactantes": 3500 }
      },
      "selenio": {
        "nome": "Selênio",
        "unidade": "mg",
        "valores": { "0_6_meses": 15, "7_11_meses": 20, "1_3_anos": 20, "4_8_anos": 30, "9_18_anos": 55, "maior_igual_19_anos": 60, "gestantes": 60, "lactantes": 70 }
      },
      "zinco": {
        "nome": "Zinco",
        "unidade": "mg",
        "valores": { "0_6_meses": 2, "7_11_meses": 3, "1_3_anos": 3, "4_8_anos": 5, "9_18_anos": 11, "maior_igual_19_anos": 11, "gestantes": 12, "lactantes": 13 }
      },
      "colina": {
        "nome": "Colina",
        "unidade": "mg",
        "valores": { "0_6_meses": 125, "7_11_meses": 150, "1_3_anos": 200, "4_8_anos": 250, "9_18_anos": 550, "maior_igual_19_anos": 550, "gestantes": 450, "lactantes": 550 }
      }
    }
  }
};

const FORMATTING_RULES = `
==============================================================================
REGRAS DE LAYOUT E FORMATAÇÃO (ANEXO XIV e IX)
==============================================================================

1. MODELO A: VERTICAL (PADRÃO)
- Estrutura de tabela clássica com bordas.
- Colunas: Quantidade por 100g/ml | Quantidade por Porção | %VD.
- Título "INFORMAÇÃO NUTRICIONAL" centralizado, negrito, caixa alta.

2. MODELO B: LINEAR (ANEXO XIV)
- Texto corrido.
- Título "INFORMAÇÃO NUTRICIONAL" (Negrito, 8pt).
- Subtítulos "Porções por embalagem: X" e "Porção: X (medida caseira)".
- Base: "Por 100 g (X g, %VD):"
- Símbolo Separador OBRIGATÓRIO: Black Circle (●) entre os constituintes.
- Exemplo: "Valor energético 100 kcal (50 kcal, 3%) ● Carboidratos 20 g (10 g, 3%) ● ..."

3. MODELO C: SIMPLIFICADA (ANEXO IX)
- Usado para declaração simplificada de vitaminas e minerais ou declaração de quantidades não significativas.
- Formato: "VITAMINAS. Por 100 g (Porção, %VD): Vitamina A 00 mg (00 mg, 0%) ● Vitamina D..."
- Negrito em "MINERAIS" e "VITAMINAS".
`;

export const NUTRITIONAL_KNOWLEDGE_BASE = `
VOCÊ É UM ESPECIALISTA EM ROTULAGEM NUTRICIONAL BRASILEIRA (ANVISA).
SUA TAREFA É CALCULAR OU AUDITAR TABELAS NUTRICIONAIS SEGUINDO ESTRITAMENTE AS REGRAS ABAIXO.

${JSON.stringify(VDR_DATA, null, 2)}

${FORMATTING_RULES}

Use o JSON "anexo_viii" para encontrar o VDR correto baseado no grupo populacional do input.
Use o JSON "anexo_ii" se o grupo for "População em Geral" ou "Adultos" (referência padrão).
`;
