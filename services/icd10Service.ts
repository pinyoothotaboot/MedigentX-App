import { ICD10Code } from '../types';

/**
 * Service to interact with the NIH ICD-10 API.
 * Implements Circuit Breaker, Timeout, and Retry patterns.
 */
export class ICD10Service {
  private readonly apiBaseUrl = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search";
  private readonly maxRetries: number;
  private readonly timeout: number;
  private readonly circuitBreakerThreshold: number;
  private readonly circuitBreakerCooldown: number;
  
  private failureCount: number = 0;
  private circuitBreakerOpenUntil: number = 0;

  constructor(
    maxRetries = 3,
    timeout = 5000, // 5 seconds
    circuitBreakerThreshold = 3,
    circuitBreakerCooldown = 30000 // 30 seconds
  ) {
    this.maxRetries = maxRetries;
    this.timeout = timeout;
    this.circuitBreakerThreshold = circuitBreakerThreshold;
    this.circuitBreakerCooldown = circuitBreakerCooldown;
  }

  /**
   * Search for ICD-10 codes using a query term.
   * @param query The search term (e.g., "asthma")
   * @returns Array of ICD10Code objects or null if service is unavailable/fails
   */
  public async search(query: string): Promise<ICD10Code[] | null> {
    // 1. Circuit Breaker Check
    if (this.failureCount >= this.circuitBreakerThreshold) {
      const now = Date.now();
      if (now < this.circuitBreakerOpenUntil) {
        console.warn(`[ICD10Service] Circuit breaker open. Skipping request. Retry after ${new Date(this.circuitBreakerOpenUntil).toLocaleTimeString()}`);
        return null;
      } else {
        // Reset after cooldown
        this.failureCount = 0;
      }
    }

    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        // API params: sf=code,name implies search fields are code and name
        const url = `${this.apiBaseUrl}?sf=code,name&terms=${encodeURIComponent(query)}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          // Response format: [count, [codes], null, [[code, description], ...]]
          const data = await response.json();
          
          const results: ICD10Code[] = [];
          
          // The 4th element (index 3) contains the detailed list of [code, description]
          if (Array.isArray(data) && data.length > 3 && Array.isArray(data[3])) {
            const details = data[3];
            for (const detail of details) {
              if (Array.isArray(detail) && detail.length >= 2) {
                const code = detail[0];
                const description = detail[1];
                // Extract category (part before the dot)
                const category = code.includes('.') ? code.split('.')[0] : code;
                
                results.push({ code, description, category });
              }
            }
          }

          // Reset failure count on success
          this.failureCount = 0;
          return results;
        } else {
          // HTTP Error
          console.warn(`[ICD10Service] Request failed with status: ${response.status}`);
          retries++;
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
           console.warn(`[ICD10Service] Request timed out after ${this.timeout}ms`);
        } else {
           console.warn(`[ICD10Service] Network error:`, error);
        }
        retries++;
      }
    }

    // All retries failed
    this.handleFailure();
    return null;
  }

  private handleFailure() {
    this.failureCount++;
    console.error(`[ICD10Service] Request failed. Failure count: ${this.failureCount}`);
    
    if (this.failureCount >= this.circuitBreakerThreshold) {
      this.circuitBreakerOpenUntil = Date.now() + this.circuitBreakerCooldown;
      console.error(`[ICD10Service] Circuit breaker ACTIVATED. Open until ${new Date(this.circuitBreakerOpenUntil).toLocaleTimeString()}`);
    }
  }
}

// Export singleton instance
export const icd10Service = new ICD10Service();
