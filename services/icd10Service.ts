
import { ICD10Code } from '../types';

export class ICD10SearchResult {
    codes: ICD10Code[] = [];
    count: number = 0;
    
    add_code(code: ICD10Code) {
        this.codes.push(code);
        this.count++;
    }

    to_dict() {
        return {
            count: this.count,
            codes: this.codes
        };
    }
}

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
   * @param sf Search fields (default: "code,name")
   * @param maxList Max results (default: 7)
   * @returns ICD10SearchResult or null if service is unavailable/fails
   */
  public async search({ terms, sf = "code,name", maxList = 7 }: { terms: string, sf?: string, maxList?: number }): Promise<ICD10SearchResult | null> {
    // Circuit Breaker check
    if (this.failureCount >= this.circuitBreakerThreshold) {
      if (Date.now() < this.circuitBreakerOpenUntil) {
        console.warn("ICD-10 Service Circuit Breaker Open. Request blocked.");
        return null;
      } else {
        this.failureCount = 0; // Reset after cooldown
      }
    }

    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const url = new URL(this.apiBaseUrl);
        url.searchParams.append("terms", terms);
        url.searchParams.append("sf", sf);
        url.searchParams.append("maxList", maxList.toString());

        const response = await fetch(url.toString(), {
          headers: { "Content-Type": "application/json" },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          // NIH API response: [count, [codes], null, [[code, description], ...]]
          
          const result = new ICD10SearchResult();
          const details = data.length > 3 ? data[3] : [];
          
          details.forEach((detail: any[]) => {
            if (detail.length >= 2) {
                const code = detail[0];
                const description = detail[1];
                const category = code.includes('.') ? code.split('.')[0] : code;
                result.add_code({ code, description, category });
            }
          });

          this.failureCount = 0; // Reset on success
          return result;
        } else {
          retries++;
        }
      } catch (error) {
        console.error(`ICD-10 API Request failed (Attempt ${retries + 1})`, error);
        retries++;
      }
    }

    // All retries failed
    this.failureCount++;
    if (this.failureCount >= this.circuitBreakerThreshold) {
      this.circuitBreakerOpenUntil = Date.now() + this.circuitBreakerCooldown;
    }
    
    return null;
  }
}
