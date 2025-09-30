// Função para validar CPF
export function validateCPF(cpf: string): { isValid: boolean; error?: string } {
  const cleanCPF = cpf.replace(/\D/g, '')
  
  if (cleanCPF.length !== 11) {
    return { isValid: false, error: 'CPF deve ter 11 dígitos' }
  }
  
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return { isValid: false, error: 'CPF inválido' }
  }
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = sum % 11
  let firstDigit = remainder < 2 ? 0 : 11 - remainder
  
  if (parseInt(cleanCPF.charAt(9)) !== firstDigit) {
    return { isValid: false, error: 'CPF inválido' }
  }
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = sum % 11
  let secondDigit = remainder < 2 ? 0 : 11 - remainder
  
  if (parseInt(cleanCPF.charAt(10)) !== secondDigit) {
    return { isValid: false, error: 'CPF inválido' }
  }
  
  return { isValid: true }
}

export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '').slice(0, 11)
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function validateRG(rg: string): { isValid: boolean; error?: string } {
  const cleanRG = rg.replace(/[^\dA-Za-z]/g, '')
  
  if (cleanRG.length < 7) {
    return { isValid: false, error: 'RG deve ter pelo menos 7 caracteres' }
  }
  
  if (cleanRG.length > 9) {
    return { isValid: false, error: 'RG deve ter no máximo 9 caracteres' }
  }
  
  return { isValid: true }
}

export function formatRG(rg: string): string {
  const cleanRG = rg.replace(/[^\dA-Za-z]/g, '').slice(0, 9)
  if (cleanRG.length <= 2) return cleanRG
  if (cleanRG.length <= 5) return cleanRG.replace(/(\d{2})(\d+)/, '$1.$2')
  if (cleanRG.length <= 8) return cleanRG.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3')
  return cleanRG.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4')
}

export async function searchAddressByCEP(cep: string): Promise<{
  success: boolean;
  data?: {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
  };
  error?: string;
}> {
  try {
    const cleanCEP = cep.replace(/\D/g, '')
    
    if (cleanCEP.length !== 8) {
      return { success: false, error: 'CEP deve ter 8 dígitos' }
    }
    
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
    
    if (!response.ok) {
      return { success: false, error: 'Erro ao buscar CEP' }
    }
    
    const data = await response.json()
    
    // Verifica se o CEP foi encontrado
    if (data.erro) {
      return { success: false, error: 'CEP não encontrado' }
    }
    
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Erro ao buscar CEP' }
  }
}

// Função para formatar CEP
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '').slice(0, 8) // Limita a 8 dígitos
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2')
}