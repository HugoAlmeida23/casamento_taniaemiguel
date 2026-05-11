# 🎨 Configuração de Tema do Website

## Como Alterar o Tema Padrão

Para mudar o tema padrão do website inteiro, edite o arquivo:

**`src/config/theme.ts`**

```typescript
export const DEFAULT_THEME: 'light' | 'dark' = 'light';
```

### Opções Disponíveis:

#### ☀️ Modo Claro (Light)
```typescript
export const DEFAULT_THEME: 'light' | 'dark' = 'light';
```
- **Cards** com fundo branco/claro (`bg-white/95`)
- Texto escuro nos cards
- Imagem de fundo inalterada
- Aparência romântica e leve

#### 🌙 Modo Escuro (Dark)
```typescript
export const DEFAULT_THEME: 'light' | 'dark' = 'dark';
```
- **Cards** com fundo cinza escuro (`gray-800/gray-900`)
- Texto branco nos cards
- Imagem de fundo inalterada
- Aparência elegante e sofisticada

**Nota:** Apenas os cards (countdown, galeria, FAQ, etc) mudam de cor. O fundo da imagem do casal permanece o mesmo.

---

## Como Funciona

1. **Tema Padrão**: Definido pela variável `DEFAULT_THEME` em `src/config/theme.ts`
2. **Preferência do Usuário**: Salva automaticamente no localStorage quando o usuário usa o toggle
3. **Prioridade**: Se o usuário já escolheu um tema, essa preferência é mantida. Caso contrário, usa o `DEFAULT_THEME`

---

## Toggle Manual

O usuário sempre pode alternar entre os modos usando o botão de toggle no canto superior direito do header, independentemente do tema padrão configurado.

---

## Exemplo de Uso

### Para deixar o site em modo escuro por padrão:

1. Abra `src/config/theme.ts`
2. Altere a linha:
   ```typescript
   export const DEFAULT_THEME: 'light' | 'dark' = 'dark';
   ```
3. Salve o arquivo
4. O website agora inicia em modo escuro por padrão

---

## Notas Importantes

- ⚡ A mudança é aplicada imediatamente ao recarregar a página
- 💾 A preferência do usuário (via toggle) sempre tem prioridade
- 🔄 Para resetar a preferência do usuário, limpe o localStorage do navegador
